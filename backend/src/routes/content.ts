import { router, settings } from "../routes"
import { Post } from "../entity/Post"
import { Comment } from "../entity/Comment"
import { Tag } from "../entity/Tag"
import { getConnection } from "typeorm"
import { checkAuthLevel } from "../middleware/middleware"

router.get("/tags/:pageNum", async (req, res) => {
    let pageNum = parseInt(req.params.pageNum)
    if (!isNaN(pageNum)) {
        try {
            let connection = getConnection()
            const postsPerPage = 10
            const postRepo = connection.getRepository(Tag)
            const qb = postRepo.createQueryBuilder("t")
                .orderBy("t.tagStr", "ASC")
                .skip((pageNum - 1) * postsPerPage)
                .take(postsPerPage)
            let tags = await qb.getMany()
            let sending = []
            tags.forEach(tag => sending.push(tag.tagStr))
            let count = await qb.getCount()
            let pages = Math.ceil(count / postsPerPage)
            res.send({
                tags: sending,
                pages
            })
        } catch {
            res.status(500).send({
                error: "Something went wrong."
            })
        }
    } else {
        res.status(400).send({
            error: "Invalid page number."
        })
    }
})

let tagPostsQuery = `
select p.id as "postId", p."createdAt", p."updatedAt", p."urlTitle", p.title, t.id as "tagId", t."tagStr", u.id, u.username
from post_tags_tag pt, tag t, "user" u,
    (select p.*
     from post p, post_tags_tag pt, tag t
     where p.id = pt."postId" 
       and pt."tagId" = t.id
       and t."tagStr" = $1) p
where p.id = pt."postId" 
  and t.id = pt."tagId"
  and u.id = p."userId"
ORDER BY p."createdAt" DESC
`

router.get("/tag/:tag/:pageNum", async (req, res) => {
    try {
        let tag = req.params.tag
        let pageNum = req.params.pageNum
        if (tag != null && pageNum != null && pageNum >= 1) {
            const postRepo = getConnection().getRepository(Post)
            let data: any[] = await postRepo.query(
                tagPostsQuery,
                [tag]
            )
            // most efficient algorithm ever, better time complexity but lower space complexity
            let sending = []
            let seen = {}
            for (let d of data) {
                if (seen[d.postId] != null) {
                    sending[seen[d.postId]].tags.push(d.tagStr)
                } else {
                    seen[d.postId] = sending.length
                    sending[seen[d.postId]] = {
                        postId: d.postId,
                        urlTitle: d.urlTitle,
                        title: d.title,
                        username: d.username,
                        createdAt: d.createdAt,
                        updatedAt: d.updatedAt,
                        tags: [d.tagStr]
                    }
                }
            }
            const postsPerPage = 10
            let pages = Math.ceil(sending.length / postsPerPage)
            let part = sending.slice((pageNum - 1) * postsPerPage, (pageNum - 1) * postsPerPage + postsPerPage)
            res.send({
                posts: part,
                pages
            })

        } else {
            res.status(404).send({
                error: "Could not find tag."
            })
        }
    } catch (err) {
        console.log(err)
        res.status(500).send({
            error: "Something went wrong."
        })
    }
})

// Gets a bunch of posts, paginated
router.get("/posts/:page", async (req, res) => {
    let pageNum = req.params.page
    let page = parseInt(pageNum)
    if (!isNaN(page)) {
        const postsPerPage = 10
        const postRepo = getConnection().getRepository(Post)
        const qb = postRepo.createQueryBuilder("p")
            .orderBy("p.createdAt", "DESC")
            .leftJoinAndSelect("p.user", "user")
            .leftJoinAndSelect("p.tags", "tag")
            .skip((pageNum - 1) * postsPerPage)
            .take(postsPerPage)
        try {
            let result = await qb.getMany()
            let posts = []
            for (let post of result) {
                let tags = []
                post.tags.forEach(tag => tags.push(tag.tagStr))
                let obj = {
                    postId: post.id,
                    urlTitle: post.urlTitle,
                    title: post.title,
                    username: post.user.username,
                    createdAt: post.createdAt,
                    updatedAt: post.updatedAt,
                    tags
                }
                posts.push(obj)
            }

            // use this to get number of pages 
            let count = await qb.getCount()
            const pages = Math.ceil(count / postsPerPage)
            res.send(
                {
                    posts,
                    pages
                }
            )
        } catch {
            res.status(500).send({
                error: "Something went wrong."
            })
        }
    } else {
        res.status(400).send({
            error: "Invalid page number."
        })
    }
})

// Gets a post with comments, paginated
router.get("/post/:postId/:urlTitle/:pageNum", checkAuthLevel, async (req, res) => {
    let pageNum = parseInt(req.params.pageNum)
    let postId = parseInt(req.params.postId)
    let urlTitle = req.params.urlTitle
    if (!isNaN(postId) && !isNaN(pageNum) && urlTitle) {
        const postsPerPage = 10
        const postRepo = getConnection().getRepository(Comment)
        const qb = postRepo.createQueryBuilder("c")
            .where("c.\"postId\" = :postId", { postId })
            .leftJoinAndSelect("c.user", "user")
            .orderBy("c.createdAt", "DESC")
            .skip((pageNum - 1) * postsPerPage)
            .take(postsPerPage)

        try {
            let dbComments = await qb.getMany()
            let comments = []
            dbComments.forEach(comment => {
                comments.push({
                    content: comment.content,
                    user: comment.user.username,
                    createdAt: comment.createdAt,
                    updatedAt: comment.updatedAt,
                    id: comment.id
                })
            })
            let count = await qb.getCount()
            const pages = Math.ceil(count / postsPerPage)
            let post = await getConnection().manager.findOne(Post, { id: postId, urlTitle }, { relations: ["user", "tags", "user.permissionBlock"] })
            let tags = []
            post.tags.forEach(tag => tags.push(tag.tagStr))
            let formattedData = {
                postId: post.id,
                urlTitle: post.urlTitle,
                title: post.title,
                content: post.content,
                username: post.user.username,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
                comments,
                pages,
                commentCount: count,
                tags,
                commentLimit: settings.limitCommentLength,
                commentLimitVal: settings.commentMaxLength,
                requiredManagePerms: res.locals.permLevel >= 2 && res.locals.permLevel >= post.user.permissionBlock.permissionLevel,
                editable: post.editable,
                commentsEnabled: post.commentsEnabled
            }
            res.send(formattedData)
        } catch (err) {
            res.status(404).send({ error: "No post found. :(" })
        }
    } else {
        res.status(400).send({
            error: "Format is: /postId/postUrlName/commentPageNum, postId & commentPageNum must be integers"
        })
    }
})

router.get("/pageinfo", (req, res) => {
    res.send({
        blogTitle: settings.blogTitle
    })
})