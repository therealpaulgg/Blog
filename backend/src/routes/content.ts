import { router, settings } from "../routes"
import { Post } from "../entity/Post"
import { Comment } from "../entity/Comment"
import { Tag } from "../entity/Tag"
import { getConnection } from "typeorm"
import { checkAuthLevel, checkAuth, checkAuthBool } from "../middleware/middleware"
import { User } from "../entity/User";
import { PostNotification } from "../entity/PostNotification";

router.get("/tags/:pageNum", async (req, res) => {
    let pageNum = parseInt(req.params.pageNum)
    if (!isNaN(pageNum)) {
        try {
            let connection = getConnection()
            const postsPerPage = 10
            let authStatus = await checkAuthBool(req.cookies["auth"])
            const postRepo = connection.getRepository(Tag)
            let qb
            if (authStatus.auth) {
                qb = postRepo.createQueryBuilder("t")
                .leftJoinAndSelect("t.posts", "post")
                .leftJoinAndSelect("post.authorizedUsers", "authorizedUser")
                .where("authorizedUser.id = :id", { id: authStatus.user.id })
                .orWhere("post.user.id = :id", { id: authStatus.user.id })
                .orWhere("post.visibility = 'public'")
                .orWhere("post.visibility = 'login_only'")                
                .orderBy("t.tagStr", "ASC")
                .skip((pageNum - 1) * postsPerPage)
                .take(postsPerPage)
            } else {
                qb = postRepo.createQueryBuilder("t")
                    .leftJoinAndSelect("t.posts", "post")
                    .where("post.visibility = 'public'")
                    .orderBy("t.tagStr", "ASC")
                    .skip((pageNum - 1) * postsPerPage)
                    .take(postsPerPage)
            }
            let tags = await qb.getMany()
            // console.log(tags[0].posts[0].user)
            let sending = []
            tags.forEach(tag => sending.push(tag.tagStr))
            let count = await qb.getCount()
            let pages = Math.ceil(count / postsPerPage)
            res.send({
                tags: sending,
                pages
            })
        } catch (err) {
            console.log(err)
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
     from post p, post_tags_tag pt, tag t, post_authorized_users_user pu
     where p.id = pt."postId" 
       and pt."tagId" = t.id
       and t."tagStr" = $1
       and (pu."postId" = p.id and pu."userId" = $2
       or p.userId = $2 or p.visibility = 'public' or p.visibility = 'login_only')
       ) p
where p.id = pt."postId" 
  and t.id = pt."tagId"
  and u.id = p."userId"
ORDER BY p."createdAt" DESC
`


let altTagPostsQuery = `
select p.id as "postId", p."createdAt", p."updatedAt", p."urlTitle", p.title, t.id as "tagId", t."tagStr", u.id, u.username
from post_tags_tag pt, tag t, "user" u,
    (select p.*
     from post p, post_tags_tag pt, tag t
     where p.id = pt."postId" 
       and pt."tagId" = t.id
       and t."tagStr" = $1
       and p.visibility = 'public') p
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
            let authStatus = await checkAuthBool(req.cookies["auth"])
            let data: any[]
            if (authStatus.auth) {
                data = await postRepo.query(
                    tagPostsQuery,
                    [tag, authStatus.user.id]
                )
                console.log(data)
            } else {
                data = await postRepo.query(
                    altTagPostsQuery,
                    [tag]
                )
            }
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
        const loginStatus = await checkAuthBool(req.cookies["auth"])
        let qb
        if (loginStatus.auth) {
            qb = postRepo.createQueryBuilder("p")
                .orderBy("p.createdAt", "DESC")
                .leftJoinAndSelect("p.user", "user")
                .leftJoinAndSelect("p.tags", "tag")
                .leftJoinAndSelect("p.authorizedUsers", "authorizedUser")
                .where("authorizedUser.id = :id", { id: loginStatus.user.id })
                .orWhere("user.id = :id", { id: loginStatus.user.id })
                .orWhere("p.visibility = 'public'")
                .orWhere("p.visibility = 'login_only'")
                .skip((pageNum - 1) * postsPerPage)
                .take(postsPerPage)
        } else {
            qb = postRepo.createQueryBuilder("p")
                .orderBy("p.createdAt", "DESC")
                .leftJoinAndSelect("p.user", "user")
                .leftJoinAndSelect("p.tags", "tag")
                .where("p.visibility = 'public'")
                .skip((pageNum - 1) * postsPerPage)
                .take(postsPerPage)
        }
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
                    content: post.content.length < 150 ? post.content : post.content.substr(0, 150) + "...",
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
        } catch (err) {
            console.log(err)
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
    console.log(req.cookies["auth"])
    let pageNum = parseInt(req.params.pageNum)
    let postId = parseInt(req.params.postId)
    let urlTitle = req.params.urlTitle
    if (!isNaN(postId) && !isNaN(pageNum) && urlTitle) {
        const commentsPerPage = 10
        const commentRepo = getConnection().getRepository(Comment)
        const qb = commentRepo.createQueryBuilder("c")
            .where("c.\"postId\" = :postId", { postId })
            .leftJoinAndSelect("c.user", "user")
            .leftJoinAndSelect("c.children", "children")
            .andWhere("c.parent IS NULL")
            .orderBy("c.createdAt", "DESC")
            .skip((pageNum - 1) * commentsPerPage)
            .take(commentsPerPage)
        try {
            let dbComments = await qb.getMany()
            let comments = []
            dbComments.forEach(comment => {
                comments.push({
                    content: comment.content,
                    user: comment.user ? comment.user.username : "[deleted]",
                    createdAt: comment.createdAt,
                    updatedAt: comment.updatedAt,
                    id: comment.id,
                    replies: comment.children.length > 0,
                    repliesCount: comment.children.length
                })
            })
            let count = await qb.getCount()
            const pages = Math.ceil(count / commentsPerPage)
            let post = await getConnection().manager.findOne(Post, { id: postId, urlTitle }, { relations: ["user", "tags", "user.permissionBlock", "authorizedUsers"] })
            let authorized = false
            let token = req.query.token
            if (token === post.sharableUrlToken) {
                authorized = true
                const data = await checkAuthBool(req.cookies["auth"])
                if (data.auth) {
                    post.authorizedUsers.push(data.user)
                    await getConnection().manager.save(post)
                }
            }
            else if (post.visibility === "public") {
                authorized = true
            } else if (post.visibility === "login_only") {
                let data = await checkAuthBool(req.cookies["auth"])
                console.log(data)
                authorized = data.auth
            } else if (post.visibility === "private") {
                let data = await checkAuthBool(req.cookies["auth"])
                // TODO: make so that the user can add 'private' posts to collection
                authorized = data.auth && (data.user.id === post.user.id || post.authorizedUsers.find(user => user.id === data.user.id) !== undefined)
            }
            if (authorized) {
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
                    commentsEnabled: post.commentsEnabled,
                    visibility: post.visibility
                }
                res.send(formattedData)
            } else {
                res.status(401).send({
                    error: "You are not authorized to access this post."
                })
            }

        } catch (err) {
            console.log(err)
            res.status(404).send({ error: "No post found. :(" })
        }
    } else {
        res.status(400).send({
            error: "Format is: /postId/postUrlName/commentPageNum, postId & commentPageNum must be integers"
        })
    }
})

router.get("/commentreplies/:id/:pageNum", async (req, res) => {
    let id = parseInt(req.params.id)
    let pageNum = parseInt(req.params.pageNum)
    if (!isNaN(id) && !isNaN(pageNum)) {
        try {
            const commentsPerPage = 10
            const commentRepo = getConnection().getRepository(Comment)
            const qb = commentRepo.createQueryBuilder("c")
                .where("c.\"parentId\" = :id", { id })
                .leftJoinAndSelect("c.user", "user")
                .leftJoinAndSelect("c.children", "children")
                .orderBy("c.createdAt", "DESC")
                .skip((pageNum - 1) * commentsPerPage)
                .take(commentsPerPage)
            let dbComments = await qb.getMany()
            let comments = []
            dbComments.forEach(comment => {
                comments.push({
                    content: comment.content,
                    user: comment.user ? comment.user.username : "[deleted]",
                    createdAt: comment.createdAt,
                    updatedAt: comment.updatedAt,
                    id: comment.id,
                    replies: comment.children.length > 0,
                    repliesCount: comment.children.length
                })
            })
            res.send(comments)
        } catch (err) {
            console.log(err)
            res.status(500).send({
                error: "Something went wrong."
            })
        }
    } else {
        res.status(400).send({
            error: "Malformed request."
        })
    }
})

router.get("/pageinfo", (req, res) => {
    try {
        res.send({
            blogTitle: settings.blogTitle
        })
    }
    catch {
        res.status(500).send({
            error: "Something went wrong."
        })
    }
})

router.get("/notifications/:pagenum", checkAuth, async (req, res) => {
    let pageNum = parseInt(req.params.pagenum)
    if (pageNum != null) {
        try {
            let connection = getConnection()
            let user = await connection.manager.findOne(User, { username: res.locals.user })
            const notificationsPerPage = 10
            const nRepo = getConnection().getRepository(PostNotification)

            const qb = nRepo.createQueryBuilder("n")
                .where("n.userid = :userid", { userid: user.id })
                .leftJoinAndSelect("n.post", "post")
                .orderBy("n.createdAt", "DESC")
                .skip((pageNum - 1) * notificationsPerPage)
                .take(notificationsPerPage)
            let notifications = await qb.getMany()
            let sending = []
            let count = await qb.getCount()
            const pages = Math.ceil(count / notificationsPerPage)
            notifications.forEach(not => {
                sending.push({
                    createdAt: not.createdAt,
                    content: not.content,
                    postUrlTitle: not.post.urlTitle,
                    postId: not.post.id,
                    id: not.id
                })
            })
            res.send({
                notifications: sending,
                pages,
                count
            })
        } catch (err) {
            console.log(err)
            res.status(500).send({
                error: "Something went wrong."
            })
        }
    } else {
        res.status(400).send({
            error: "Malformed request."
        })
    }
})

router.post("/dismiss", checkAuth, async (req, res) => {
    let notId = req.body.id
    if (notId != null) {
        try {
            let connection = getConnection()
            let not = await connection.manager.findOne(PostNotification, { id: notId }, { relations: ["user"] })
            if (not.user.username === res.locals.user) {
                connection.manager.remove(not)
                res.send({
                    success: "Notification dismissed."
                })
            } else {
                res.status(401).send({
                    error: "You do not have permission to perform this action."
                })
            }
        } catch {
            res.status(500).send({
                error: "Something went wrong."
            })
        }
    } else {
        res.status(400).send({
            error: "Malformed request."
        })
    }
})

router.post("/dismissall", checkAuth, async (req, res) => {
    try {
        let connection = getConnection()
        let user = await connection.manager.findOne(User, { username: res.locals.user }, { relations: ["postNotifications"] })
        await connection.manager.remove(user.postNotifications)
        res.send({
            success: "All notifications cleared."
        })
    } catch {
        res.status(500).send({
            error: "Something went wrong."
        })
    }
})