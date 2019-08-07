import express from "express"
import { getConnection } from "typeorm";
import jwt from "jsonwebtoken";
import argon2 from "argon2"
import { Post } from "./entity/Post";
import { User } from "./entity/User";
import { Comment } from "./entity/Comment";
import { PermissionBlock } from "./entity/PermissionBlock";

let router = express.Router()

router.get("/", (req, res) => res.send("Hello world"))

// Gets a bunch of posts, paginated
router.get("/posts/:page", async (req, res) => {
    let pageNum = req.params.page
    if (parseInt(pageNum)) {
        const postsPerPage = 10
        const postRepo = getConnection().getRepository(Post)
        const qb = postRepo.createQueryBuilder("p")
            .orderBy("p.createdAt", "DESC")
            .leftJoinAndSelect("p.user", "user")
            .skip((pageNum - 1) * postsPerPage)
            .take(postsPerPage)
        try {
            let result = await qb.getMany()
            let posts = []
            for (let post of result) {
                let obj = {
                    postId: post.id,
                    urlTitle: post.urlTitle,
                    title: post.title,
                    content: post.content,
                    username: post.user.username,
                    createdAt: post.createdAt,
                    updatedAt: post.updatedAt
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
        } catch (__) {
            res.status(500).send({
                error: "Something went wrong."
            })
        }
    } else {
        res.status(400).send({
            error: "Must specify a page number: /posts/:pagenum"
        })
    }
})

// Gets a post with comments, paginated
router.get("/post/:postId/:urlTitle/:pageNum", async (req, res) => {
    let pageNum = parseInt(req.params.pageNum)
    let postId = parseInt(req.params.postId)
    if (postId && pageNum) {
        const postsPerPage = 10
        const postRepo = getConnection().getRepository(Comment)
        const qb = postRepo.createQueryBuilder("c")
            .where("c.postId = :postId", { postId })
            .leftJoinAndSelect("c.user", "user")
            .orderBy("c.createdAt", "DESC")
            .skip((pageNum - 1) * postsPerPage)
            .take(postsPerPage)

        try {
            let result = await qb.getMany()
            let comments = []
            result.forEach(comment => {
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

            getConnection().manager.findOne(Post, { id: req.params.postId }, { relations: ["user"] }).then(result => {
                let formattedData = {
                    postId: result.id,
                    urlTitle: result.urlTitle,
                    title: result.title,
                    content: result.content,
                    username: result.user.username,
                    createdAt: result.createdAt,
                    updatedAt: result.updatedAt,
                    comments,
                    pages,
                    commentCount: count
                }
                res.send(formattedData)
            }).catch(err => res.send({ title: "Oof!", content: "No post found. :(" }))

        } catch (err) {
            // This is the actual 'title' and 'content' info that is sent to user, so should be 200 OK.
            res.send({ error: "No post could be found.", title: "Oof!", content: "No post found. :(" })
        }
    } else {
        res.status(400).send({
            error: "Format is: /postId/postUrlName/commentPageNum, postId & commentPageNum must be integers"
        })
    }
})

// Checks to see if an admin exists. If not, lets an admin account be created.
router.get("/cansetup", async (req, res) => {
    try {
        let connection = getConnection()
        let admin = await connection.manager.findOne(PermissionBlock, { superAdmin: true })
        let foo = {
            canSetup: false
        }
        if (!admin) {
            foo.canSetup = true;
            res.send(foo);
        } else {
            res.send(foo);
        }
    } catch (__) {
        res.status(500).send({
            error: "Something went wrong."
        })
    }

})

// Checks to see if user is able to post (currently simply checks if is a superAdmin)
router.get("/canpost", checkAuth, async (req, res) => {
    try {
        let connection = getConnection();
        let user = await connection.manager.findOne(User, { username: res.locals.user }, { relations: ["permissionBlock"] });
        let foo = {
            canPost: false
        }
        if (user.permissionBlock.superAdmin) {
            foo.canPost = true;
        }
        res.send(foo)
    } catch (__) {
        res.status(500).send({
            error: "Something went wrong."
        })
    }
})

// Registers a superadmin as long as initial setup is still possible.
router.post("/initialsetup", async (req, res) => {
    let connection = getConnection();
    let admin = await connection.manager.findOne(PermissionBlock, { superAdmin: true })
    if (admin) {
        res.status(401).send({
            error: "Not allowed."
        })
    } else {
        try {
            let permissionBlock = new PermissionBlock();
            permissionBlock.superAdmin = true;
            await connection.manager.save(permissionBlock);
            await connection.manager.save(User, {
                username: req.body.username as string,
                email: req.body.email as string,
                password_hash: await argon2.hash(req.body.password) as string,
                permissionBlock: permissionBlock
            })
            res.send({
                success: "Admin user created."
            });
        } catch (err) {
            res.status(500).send({
                error: "Something went wrong."
            })
        }
    }
})

// Posts a comment (anyone can do this, need to use recaptcha in future or disable registration)
router.post("/comment", checkAuth, async (req, res) => {
    // Data should be sent through body
    let connection = getConnection()
    let post = await connection.manager.findOne(Post, { urlTitle: req.body.urlTitle })
    let user = await connection.manager.findOne(User, { username: res.locals.user })
    if (post && user) {
        let content: string = req.body.content
        if (content != null && content.length > 0 && content.length <= 2000) {
            let comment = new Comment()
            comment.post = post
            comment.content = content
            comment.user = user
            await connection.manager.save(comment)
            res.send({
                success: "Comment posted."
            })
        } else {
            res.status(400).send({
                error: "Comment content body format invalid (nonexistent, empty, or longer than 2000 chars)"
            })
        }
    } else {
        res.status(404).send({
            error: "Post not found or user not found."
        })
    }
})

// Code for creating a new post
router.post("/newpost", checkAuth, checkAdmin, async (req, res) => {
    let connection = getConnection()
    let title: string = req.body.title
    let content = req.body.content
    if ((title != null && title.length > 0) && (content != null && content.length > 0)) {
        try {
            let post = new Post()
            post.title = title
            post.content = content
            post.urlTitle = title.replace(/\W+/g, '-').toLowerCase()
            let user = await connection.manager.findOne(User, { username: res.locals.user })
            post.user = user
            await connection.manager.save(post)
            res.send("Done")
        } catch (__) {
            res.status(500).send({
                error: "Something went wrong."
            })
        }

    } else {
        res.status(400).send({
            error: "Missing title or post content."
        })
    }
})

router.post("/editpost", checkAuth, async (req, res) => {
    let connection = getConnection()
    try {
        let post = await connection.manager.findOne(Post, { id: req.body.id }, { relations: ["user"] })
        if (post.user.username === res.locals.user) {
            let title = req.body.newTitle
            post.title = title
            post.content = req.body.newContent
            post.urlTitle = title.replace(/\W+/g, '-').toLowerCase()
            await connection.manager.save(post)
            res.send({
                urlTitle: post.urlTitle
            })
        } else {
            res.status(401).send({
                error: "You are not the owner of this post."
            })
        }
    } catch (err) {
        res.status(400).send({
            error: "Bad request."
        })
    }
})

// TODO: password requirements
router.post("/register", async (req, res) => {
    if (req.body.username.length < 30) {
        let connection = await getConnection()
        let user = await connection.manager.findOne(User, { username: req.body.username })
        if (!user) {
            let permissionBlock = new PermissionBlock();
            await connection.manager.save(permissionBlock);
            await connection.manager.save(User, {
                username: req.body.username as string,
                email: req.body.email as string,
                password_hash: await argon2.hash(req.body.password) as string,
                permissionBlock
            })
            res.send("registered")
        } else {
            res.status(400).send({
                error: "User with this username already exists."
            })
        }
    } else {
        res.status(400).send({
            error: "Username too long (must be < 30 characters)."
        })
    }
})

router.post("/deletepost", checkAuth, (req, res) => {
    let connection = getConnection()
    connection.manager.findOne(Post, { id: req.body.id }, { relations: ["user", "comments"] }).then(async (post) => {
        if (post.user.username === res.locals.user) {
            if (post.comments) {
                await connection.manager.remove(post.comments)
            }
            await connection.manager.remove(post)
            res.send({
                success: "Post deleted."
            })
        } else {
            res.status(401).send({
                error: "You are not the owner of this post."
            })
        }
    }).catch(() => res.status(404).send({
        error: "Post does not exist."
    }))
})

router.post("/deletecomment", checkAuth, async (req, res) => {
    let connection = getConnection();
    let id = req.body.id
    try {
        let user = await connection.manager.findOne(User, { username: res.locals.user }, { relations: ["permissionBlock"] })
        let comment = await connection.manager.findOne(Comment, { id: id }, { relations: ["post", "user", "post.user"] })
        let commentUser = comment.user;
        if (res.locals.user === commentUser.username || comment.post.user.username === res.locals.user || user.permissionBlock.superAdmin) {
            await connection.manager.remove(comment);
            res.send({
                success: "Deleted."
            })
        } else {
            res.status(401).send({
                error: "Unauthorized"
            })
        }
    } catch (err) {
        res.status(404).send({
            error: "No comment found."
        })
    }
})

router.post("/login", (req, res) => {
    getConnection().manager.findOne(User, { username: req.body.username }, { relations: ["permissionBlock"] }).then(async result => {
        if (await argon2.verify(result.password_hash, req.body.password)) {
            let token = jwt.sign({ username: req.body.username }, "VERYSECRETKEY", { expiresIn: 60 * 30 })
            let age = 30 * 60 * 1000
            res.cookie("auth", token, { maxAge: age })
            let date = new Date(new Date().getTime() + age).getTime();
            res.cookie("expiration", date, { maxAge: age })
            res.send({
                username: req.body.username,
                admin: result.permissionBlock.superAdmin
            })
        } else {
            res.status(401).send({
                error: "Unauthorized"
            })
        }
    }).catch(() => res.status(401).send(res.status(401).send({
        error: "User not found in our system."
    })))
})

router.post("/renew-jwt", checkAuth, (req, res) => {
    let token = jwt.sign({ username: res.locals.user }, "VERYSECRETKEY", { expiresIn: 60 * 30 });
    let age = 30 * 60 * 1000;
    res.cookie("auth", token, { maxAge: age });
    let date = new Date(new Date().getTime() + age).getTime();
    res.cookie("expiration", date, { maxAge: age });
    res.send({
        success: "JWT renewed"
    });
})

// Middleware function
function checkAuth(req, res, next) {
    try {
        let token: any = jwt.verify(req.cookies["auth"], "VERYSECRETKEY")
        res.locals.user = token.username
        next()
    } catch (__) {
        res.status(401).send({
            error: "Unauthorized"
        })
    }
}

// Middleware function
async function checkAdmin(req, res, next) {
    try {
        let connection = getConnection()
        let user = await connection.manager.findOne(User, { username: res.locals.user }, { relations: ["permissionBlock"] });
        if (user.permissionBlock.superAdmin) {
            next();
        } else {
            res.status(401).send({
                error: "Unauthorized"
            })
        }
    } catch (err) {
        res.status(401).send({
            error: "Unauthorized"
        })
    }
}

export = router 