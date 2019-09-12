import { router } from "../routes"
import { checkAuth, checkAuthBool } from "../middleware/middleware"
import { getConnection, Brackets } from "typeorm"
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
            let authStatus = await checkAuthBool(req.cookies["auth"])
            let qb
            if (authStatus.auth) {
                if (authStatus.user.permissionBlock.permissionLevel >= 3) {
                    qb = postRepo.createQueryBuilder("p")
                    .orderBy("p.createdAt", "DESC")
                    .leftJoinAndSelect("p.user", "user")
                    .leftJoinAndSelect("p.tags", "tag")
                    .where("p.\"userId\" = :userId", {userId: user.id})
                    .skip((page - 1) * postsPerPage)
                    .take(postsPerPage)
                } else {
                    qb = postRepo.createQueryBuilder("p")
                    .orderBy("p.createdAt", "DESC")
                    .leftJoinAndSelect("p.user", "user")
                    .leftJoinAndSelect("p.tags", "tag")
                    .leftJoinAndSelect("p.authorizedUsers", "authorizedUser")
                    .where("p.\"userId\" = :userId", {userId: user.id})
                    .andWhere(new Brackets((qb) => {
                        qb.where("authorizedUser.id = :id", { id: authStatus.user.id})
                        .orWhere("p.visibility = 'public'")
                        .orWhere("p.visibility = 'login_only'")
                        .orWhere("user.id = :id", {id: authStatus.user.id})
                    }))
                    .skip((page - 1) * postsPerPage)
                    .take(postsPerPage)
                }
            } else {
                qb = postRepo.createQueryBuilder("p")
                .orderBy("p.createdAt", "DESC")
                .leftJoinAndSelect("p.user", "user")
                .leftJoinAndSelect("p.tags", "tag")
                .where("p.visibility = 'public'")
                .andWhere("p.\"userId\" = :userId", {userId: user.id})
                .skip((page - 1) * postsPerPage)
                .take(postsPerPage)
            }
            
            let result = await qb.getMany()
            let count = await qb.getCount()
            const pages = Math.ceil(count / postsPerPage)
            let posts = []
            for (let post of result) {
                console.log(post.authorizedUsers)
                let tags = []
                post.tags.forEach(tag => tags.push(tag.tagStr))
                let obj = {
                    postId: post.id,
                    urlTitle: post.urlTitle,
                    title: post.title,
                    username: user.username,
                    createdAt: post.createdAt,
                    updatedAt: post.updatedAt,
                    tags,
                    visibility: post.visibility
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
            let authStatus = await checkAuthBool(req.cookies["auth"])
            let qb
            if (authStatus.auth) {
                qb = postRepo.createQueryBuilder("c")
                .where("c.userId = :userId", { userId: user.id })
                .leftJoinAndSelect("c.post", "p")
                .leftJoinAndSelect("c.user", "user")
                .leftJoinAndSelect("p.authorizedUsers", "authorizedUser")
                .andWhere(new Brackets((qb) => {
                    qb.where("authorizedUser.id = :id", { id: authStatus.user.id})
                    .orWhere("p.visibility = 'public'")
                    .orWhere("p.visibility = 'login_only'")
                    .orWhere("user.id = :id", {id: authStatus.user.id})
                }))
                .orderBy("c.createdAt", "DESC")
                .skip((page - 1) * commentsPerPage)
                .take(commentsPerPage)
            } else {
                qb = postRepo.createQueryBuilder("c")
                .where("c.userId = :userId", { userId: user.id })
                .leftJoinAndSelect("c.post", "p")
                .andWhere("p.visibility = 'public'")
                .orderBy("c.createdAt", "DESC")
                .skip((page - 1) * commentsPerPage)
                .take(commentsPerPage)
            }
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

    } catch (err) {
        console.log(err)
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
