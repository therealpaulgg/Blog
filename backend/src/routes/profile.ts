import { router } from "../routes"
import { checkAuth } from "../middleware/middleware"
import { getConnection } from "typeorm"
import { User } from "../entity/User"
import { Comment } from "../entity/Comment"
import { Post } from "../entity/Post"
import { getPermStr } from "./authentication"

router.get("/profile/:username", async (req, res) => {
    try {
        let connection = getConnection()
        let user = await connection.manager.findOne(User, { username: req.params.username }, { relations: ["permissionBlock", "posts", "comments"] })
        if (user) {
            let permissionLevel = getPermStr(user.permissionBlock)
            res.send({
                username: user.username,
                gravatarUrl: user.gravatarUrl,
                createdAt: user.createdAt,
                permissionLevel,
                bio: user.bio
            })
        } else {
            res.status(404).send({
                error: "User not found."
            })
        }
    } catch {
        res.status(500).send({
            error: "Something went wrong."
        })
    }
})

router.get("/userposts/:username/:page", async (req, res) => {
    let username = req.params.username
    try {
        let user = await getConnection().manager.findOne(User, { username })
        if (user) {
            const postsPerPage = 10
            let page = req.params.page
            const postRepo = getConnection().getRepository(Post)
            const qb = postRepo.createQueryBuilder("p")
                .where("p.\"userId\" = :userId", { userId: user.id })
                .leftJoinAndSelect("p.tags", "tag")
                .orderBy("p.createdAt", "DESC")
                .skip((page - 1) * postsPerPage)
                .take(postsPerPage)
            let result = await qb.getMany()
            let count = await qb.getCount()
            const pages = Math.ceil(count / postsPerPage)
            let posts = []
            for (let post of result) {
                let tags = []
                post.tags.forEach(tag => tags.push(tag.tagStr))
                let obj = {
                    postId: post.id,
                    urlTitle: post.urlTitle,
                    title: post.title,
                    username: user.username,
                    createdAt: post.createdAt,
                    updatedAt: post.updatedAt,
                    tags
                }
                posts.push(obj)
            }
            res.send({
                posts,
                pages
            })
        } else {
            res.status(404).send({
                error: "User not found."
            })
        }

    } catch (err) {
        console.log(err)
        res.status(500).send({
            error: "Something went wrong.",
            obj: err
        })
    }
})

router.get("/usercomments/:username/:page", async (req, res) => {
    let username = req.params.username
    try {
        let user = await getConnection().manager.findOne(User, { username })
        if (user) {
            const commentsPerPage = 10
            let page = req.params.page
            const postRepo = getConnection().getRepository(Comment)
            const qb = postRepo.createQueryBuilder("c")
                .where("c.userId = :userId", { userId: user.id })
                .leftJoinAndSelect("c.post", "post")
                .orderBy("c.createdAt", "DESC")
                .skip((page - 1) * commentsPerPage)
                .take(commentsPerPage)
            let result = await qb.getMany()
            let count = await qb.getCount()
            const pages = Math.ceil(count / commentsPerPage)
            let comments = []
            for (let comment of result) {
                let obj = {
                    commentId: comment.id,
                    postUrlTitle: comment.post.urlTitle,
                    postId: comment.post.id,
                    user: user.username,
                    createdAt: comment.createdAt,
                    updatedAt: comment.updatedAt,
                    content: comment.content
                }
                comments.push(obj)
            }
            res.send({
                comments,
                pages
            })
        } else {
            res.status(404).send({
                error: "User not found."
            })
        }

    } catch {
        res.status(500).send({
            error: "Something went wrong."
        })
    }
})

router.post("/updatebio", checkAuth, async (req, res) => {
    let bio = req.body.bio
    let username = req.body.username
    if (res.locals.user === username) {
        try {
            let connection = getConnection()
            let user = await connection.manager.findOne(User, { username })
            if (user) {
                user.bio = bio
                connection.manager.save(user)
                res.send({
                    success: "Bio updated successfully."
                })
            } else {
                res.status(500).send({
                    error: "Something went wrong."
                })
            }
        } catch {
            res.status(500).send({
                error: "Something went wrong."
            })
        }
    } else {
        res.status(401).send({
            error: "You are not authorized to perform this action."
        })
    }
})
