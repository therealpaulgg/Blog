import express, { Response, Request } from "express"
import { createConnection, getConnection } from "typeorm"
import jwt from "jsonwebtoken"
import argon2 from "argon2"
import { Post } from "./entity/Post"
import { User } from "./entity/User"
import { Comment } from "./entity/Comment"
import { PermissionBlock } from "./entity/PermissionBlock"
import validator from "validator"
import md5 from "md5"
import { Tag } from "./entity/Tag"
import Mail from "./services/mail"
import { Permissions } from "./services/permissions"
import { SettingsService } from "./services/settings"

let settings: SettingsService | null = null

let domainStr = ""
if (process.env.ENVIRONMENT === "staging" || process.env.ENVIRONMENT === "prod") {
    domainStr = "paulgellai.dev"
} else {
    domainStr = "localhost"
}

// must be done in same scope as app
createConnection().then(() => settings = new SettingsService())

let router = express.Router()

router.get("/", (req, res) => res.send("Hello world"))

router.get("/tags/:pageNum", async (req, res) => {
    let pageNum = parseInt(req.params.pageNum)
    if (pageNum) {
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
    }
})

router.get("/tag/:tag/:pageNum", async (req, res) => {
    try {
        let id = parseInt(req.params.id)
        let tag = req.params.tag
        let pageNum = req.params.pageNum
        if (id != null && tag != null && pageNum != null && pageNum >= 1) {
            const postRepo = getConnection().getRepository(Post)
            let data: any[] = await postRepo.query(
                `
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
                `,
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
    if (parseInt(pageNum)) {
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
            error: "Must specify a page number: /posts/:pagenum"
        })
    }
})

// Gets a post with comments, paginated
router.get("/post/:postId/:urlTitle/:pageNum", checkAuthLevel, async (req, res) => {
    let pageNum = parseInt(req.params.pageNum)
    let postId = parseInt(req.params.postId)
    let urlTitle = req.params.urlTitle
    if (postId && pageNum && urlTitle) {
        const postsPerPage = 10
        const postRepo = getConnection().getRepository(Comment)
        const qb = postRepo.createQueryBuilder("c")
            .where("c.\"postId\" = :postId", { postId })
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

            getConnection().manager.findOne(Post, { id: postId, urlTitle }, { relations: ["user", "tags", "user.permissionBlock"] }).then(result => {
                let tags = []
                result.tags.forEach(tag => tags.push(tag.tagStr))
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
                    commentCount: count,
                    tags,
                    commentLimit: settings.limitCommentLength,
                    commentLimitVal: settings.commentMaxLength,
                    requiredManagePerms: res.locals.permLevel >= 2 && res.locals.permLevel >= result.user.permissionBlock.permissionLevel
                }
                res.send(formattedData)
            }).catch(err => res.status(404).send({ error: "No post found. :(" }))

        } catch (err) {
            res.status(404).send({ error: "No post found. :(" })
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
        let admin = await connection.manager.findOne(PermissionBlock, { permissionLevel: 3 })
        let foo = {
            canSetup: false
        }
        if (!admin) {
            foo.canSetup = true
            res.send(foo)
        } else {
            res.send(foo)
        }
    } catch {
        res.status(500).send({
            error: "Something went wrong."
        })
    }
})

// Checks to see if user is able to post 
router.get("/canpost", checkAuth, async (req, res) => {
    try {
        let connection = getConnection()
        let user = await connection.manager.findOne(User, { username: res.locals.user }, { relations: ["permissionBlock"] })
        let foo = {
            canPost: false
        }
        // 1 represents the author permission level.
        if (user.permissionBlock.permissionLevel >= 1) {
            foo.canPost = true
        }
        res.send(foo)
    } catch {
        res.status(500).send({
            error: "Something went wrong."
        })
    }
})

// Explicitly checks if user is admin (if conditions for posting are changed)
router.get("/isadmin", checkAuth, async (req, res) => {
    try {
        let connection = getConnection()
        let user = await connection.manager.findOne(User, { username: res.locals.user }, { relations: ["permissionBlock"] })
        let foo = {
            isAdmin: false
        }
        if (user.permissionBlock.permissionLevel >= 3) {
            foo.isAdmin = true
        }
        res.send(foo)
    } catch {
        res.status(500).send({
            error: "Something went wrong."
        })
    }
})

router.get("/permissionlevel", checkAuth, async (req, res) => {
    try {
        let connection = getConnection()
        let user = await connection.manager.findOne(User, { username: res.locals.user }, { relations: ["permissionBlock"] })
        let level = ""
        switch (user.permissionBlock.permissionLevel) {
            case 3:
                level = "superadmin"
                break
            case 2:
                level = "moderator"
                break
            case 1:
                level = "author"
                break
            case 0:
                level = "normal"
                break
            default:
                level = "normal"
                break
        }
        res.send({
            level
        })
    } catch {
        res.status(500).send({
            error: "Something went wrong."
        })
    }
})

// if user has all permission fields, should return the highest one
function getPermStr(perm: PermissionBlock | number) {
    let thing = 0
    if (perm instanceof PermissionBlock) {
        thing = perm.permissionLevel
    } else {
        thing = perm
    }
    switch (thing) {
        case 3: return "superadmin"
        case 2: return "moderator"
        case 1: return "author"
        case 0: return "normal"
        default: return "normal"
    }

}

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

router.get("/administration/:page", checkAuth, checkPermissions, async (req, res) => {
    let page = parseInt(req.params.page)
    if (page != null) {
        try {
            const usersPerPage = 10
            let page = req.params.page
            const userRepo = getConnection().getRepository(User)
            const qb = userRepo.createQueryBuilder("u")
                .orderBy("u.username", "ASC")
                .leftJoinAndSelect("u.posts", "posts")
                .leftJoinAndSelect("u.comments", "comments")
                .leftJoinAndSelect("u.permissionBlock", "permissionBlock")
                .skip((page - 1) * usersPerPage)
                .take(usersPerPage)
            let result = await qb.getMany()
            let count = await qb.getCount()
            const pages = Math.ceil(count / usersPerPage)
            let users = []
            for (let user of result) {

                let obj = {
                    username: user.username,
                    email: user.email,
                    postCount: user.posts.length,
                    commentCount: user.comments.length,
                    permissionLevel: getPermStr(user.permissionBlock)
                }
                users.push(obj)
            }
            res.send({
                users,
                pages,

            })
        } catch (err) {
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

router.get("/resetpassword/:token", (req, res) => {
    let token = req.params.token
    if (token != null) {
        try {
            let contents: any = jwt.verify(token, "VERYSECRETKEY")
            if (contents != null) {
                res.send({
                    username: contents.username,
                    email: contents.email
                })
            } else {
                res.status(401).send({
                    error: "Invalid token."
                })
            }
        } catch {
            res.status(401).send({
                error: "Invalid token."
            })
        }
    } else {
        res.status(400).send({
            error: "No token sent."
        })
    }
})

router.get("/settingdata", checkAuth, checkPermissions, async (req, res) => {
    settings.reloadSettings()
    res.send({
        limitCommentLength: settings.limitCommentLength,
        commentMaxLength: settings.commentMaxLength,
        limitPostTitleLength: settings.limitPostTitleLength,
        postTitleMaxLength: settings.postTitleMaxLength,
        registrationEnabled: settings.registrationEnabled
    })
})

router.post("/settingdata", checkAuth, checkPermissions, async (req, res) => {
    if (req.body.limitCommentLength != null &&
        req.body.commentMaxLength != null &&
        req.body.limitPostTitleLength != null &&
        req.body.postTitleMaxLength != null &&
        req.body.registrationEnabled != null) {
        await settings.newSettings(req.body)
        res.send({
            success: "Settings updated."
        })
    } else {
        res.status(400).send({
            error: "Malformed request."
        })
    }
})

router.post("/setuserpermissions", checkAuth, checkPermissions, async (req, res) => {
    let username = req.body.username
    let permissionLevel = req.body.permissionLevel
    if (username != null && permissionLevel != null && res.locals.user !== username) {
        let connection = getConnection()
        let user = await connection.manager.findOne(User, { username }, { relations: ["permissionBlock"] })
        if (user != null) {
            let newPerms: number | null = null
            switch (permissionLevel) {
                case "superadmin":
                    newPerms = 3
                    break
                case "moderator":
                    newPerms = 2
                    break
                case "author":
                    newPerms = 1
                    break
                case "normal":
                    newPerms = 0
                    break
                default:
                    newPerms = 0
                    break
            }
            user.permissionBlock.permissionLevel = newPerms
            await connection.manager.save(user.permissionBlock)
            await connection.manager.save(user)
            res.send({
                success: "User permissions updated."
            })
        } else {
            res.status(404).send({
                error: "User not found."
            })
        }
    } else {
        res.status(400).send({
            error: "Malformed request (or you tried to change your own permissions)."
        })
    }
})

router.post("/changepassword", checkAuth, async (req, res) => {
    let username = req.body.username
    let password = req.body.password
    let oldPassword = req.body.oldPassword
    if (username === res.locals.user && password != null && oldPassword != null) {
        let connection = getConnection()
        let user = await connection.manager.findOne(User, { username })
        if (await argon2.verify(user.password_hash, oldPassword)) {
            user.password_hash = await argon2.hash(password)
            try {
                await connection.manager.save(user)
                res.send({
                    success: "Password successfully changed."
                })
            } catch {
                res.status(500).send({
                    error: "Something went wrong."
                })
            }
        } else {
            res.status(401).send({
                error: "Invalid password for user."
            })
        }
    } else {
        res.status(400).send({
            error: "Malformed request."
        })
    }
})


router.post("/changeemail", checkAuth, async (req, res) => {
    let email = req.body.email
    if (email != null) {
        if (validator.isEmail(email)) {
            let connection = getConnection()
            try {
                let user = await connection.manager.findOne(User, { username: res.locals.user })
                user.email = email
                await connection.manager.save(user)
                res.send({
                    success: "Email successfully changed."
                })
            } catch {
                res.status(500).send({
                    error: "Something went wrong."
                })
            }
        } else {
            res.status(400).send({
                error: "Email is invalid."
            })
        }
    } else {
        res.status(400).send({
            error: "Malformed request."
        })
    }
})

router.post("/admindeleteuser/:username", checkAuth, checkPermissions, async (req, res) => {
    let username = req.params.username
    if (username != null) {
        try {
            let connection = getConnection()
            let user = await connection.manager.findOne(User, { username }, { relations: ["comments", "posts", "permissionBlock"] })
            if (user != null) {
                // delete all user comments TODO: make 'deleted' if parent of replies
                for (let comment of user.comments) {
                    connection.manager.remove(comment)
                }
                // delete all user posts 
                for (let post of user.posts) {
                    connection.manager.remove(post)
                }
                connection.manager.remove(user.permissionBlock)
                connection.manager.remove(user)
                res.send({
                    success: "User successfully deleted."
                })
            } else {
                res.status(404).send({
                    error: "User not found."
                })
            }
        } catch (err) {
            res.status(500).send({
                error: "Something went wrong."
            })
        }
    } else {
        res.status(400).send({
            error: "Invalid username field."
        })
    }
})

router.post("/resetpassword/:token", async (req, res) => {
    let token = req.params.token
    let password = req.body.password
    if (token != null) {
        if (password != null) {
            try {
                let contents: any = jwt.verify(token, "VERYSECRETKEY")
                if (contents != null) {
                    try {
                        let username = contents.username
                        let email = contents.email
                        let connection = getConnection()
                        let user = await connection.manager.findOne(User, { username, email })
                        if (user != null) {
                            user.password_hash = await argon2.hash(password)
                            connection.manager.save(user)
                            res.send({
                                success: "Password successfully reset, please login."
                            })
                        } else {
                            res.status(401).send({
                                error: "Token malformed - could not verify username & email. Please make a new password reset request."
                            })
                        }
                    } catch {
                        res.status(500).send({
                            error: "Something went wrong."
                        })
                    }
                } else {
                    res.status(401).send({
                        error: "Invalid token."
                    })
                }
            } catch {
                res.status(401).send({
                    error: "Invalid token."
                })
            }
        } else {
            res.status(400).send({
                error: "No password was found in your request."
            })
        }
    } else {
        res.status(400).send({
            error: "No token sent."
        })
    }
})

router.post("/resetpasswordreq", async (req, res) => {
    let email = req.body.email
    if (email != null) {
        try {
            let user = await getConnection().manager.findOne(User, { email: req.body.email })
            if (user != null) {
                Mail.to = user.email
                let token = jwt.sign({
                    username: user.username,
                    email: user.email,
                }, "VERYSECRETKEY", { expiresIn: 60 * 30 })
                Mail.message =
                    `<p>Hello ${user.username},</p>
                <p>Someone has requested a reset to your password.</p>
                <p>If this was you, click on the following link or copy it into your browser:</p>
                <p><a href='http://localhost:8080/resetpassword/${token}'>http://localhost:8080/resetpassword/${token}</a></p>
                <p>This token will expire in 30 minutes.</p>
                
                <p>If this was not you, you can ignore this email.</p>
                `
                let success = await Mail.sendMail()
                res.send({
                    success
                })
            } else {
                res.status(404).send({
                    error: "That email was not found in our system."
                })
            }
        } catch {
            res.status(404).send({
                error: "That email was not found in our system."
            })
        }
    } else {
        res.status(400).send({
            error: "You must include an email in your request."
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

// Registers a superadmin as long as initial setup is still possible.
router.post("/initialsetup", async (req, res) => {
    let connection = getConnection()
    let admin = await connection.manager.findOne(PermissionBlock, { permissionLevel: 3 })
    if (admin) {
        res.status(401).send({
            error: "Not allowed."
        })
    } else {
        try {
            let permissionBlock = new PermissionBlock()
            permissionBlock.permissionLevel = 3
            let username = req.body.username
            let email = req.body.email
            let password = req.body.password
            if (username != null && email != null && password != null) {
                registerUser(permissionBlock, username, email, password, res)
            } else {
                res.status(400).send({
                    error: "Missing username, email, or password."
                })
            }

        } catch (err) {
            res.status(500).send({
                error: "Something went wrong."
            })
        }
    }
})

// Posts a comment (anyone can do this, need to use recaptcha in future or disable registration)
router.post("/comment", checkAuth, checkPermissions, async (req, res) => {
    // Data should be sent through body
    try {
        let connection = getConnection()
        let post = await connection.manager.findOne(Post, { id: req.body.id, urlTitle: req.body.urlTitle })
        let user = await connection.manager.findOne(User, { username: res.locals.user })
        if (post && user) {
            let content: string = req.body.content
            if (content != null && content.length > 0 && ((!settings.limitCommentLength) || (content.length <= settings.commentMaxLength && settings.limitCommentLength))) {
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
                    error: `Comment content body format invalid (nonexistent, empty, or longer than ${settings.commentMaxLength} chars)`
                })
            }
        } else {
            res.status(404).send({
                error: "Post not found or user not found."
            })
        }
    } catch {
        res.status(40).send({
            error: "Malformed request."
        })
    }
    
})

async function parseTags(tags: string): Promise<Tag[]> {
    // returns Tag objects from database or makes new ones and then returns them all
    let re = /(^|\s)#([a-z\d-_]+)/g, match
    let foo = []
    while (match = re.exec(tags)) {
        if (!foo.find(thing => thing === match[2])) foo.push(match[2])
    }
    let returnVal = []
    let connection = getConnection()
    for (let tag of foo) {
        try {
            let bar = await connection.manager.findOne(Tag, { tagStr: tag })
            let newTag
            if (bar == null) {
                newTag = new Tag()
                newTag.tagStr = tag
                await connection.manager.save(newTag)
            } else newTag = bar
            returnVal.push(newTag)
        } catch {
            console.log("Couldn't query database for tag, or save tag.")
        }
    }
    return returnVal
}

// Code for creating a new post
router.post("/newpost", checkAuth, checkPermissions, async (req, res) => {
    let connection = getConnection()
    let title: string = req.body.title
    let content = req.body.content
    let tags = req.body.tags
    if ((title != null && title.length > 0) &&
        (content != null && content.length > 0) &&
        ((settings.limitPostTitleLength && title.length <= settings.postTitleMaxLength) || !settings.limitPostTitleLength)) {
        try {
            let post = new Post()
            post.title = title
            post.content = content
            post.urlTitle = title.replace(/\W+/g, '-').toLowerCase()
            let user = await connection.manager.findOne(User, { username: res.locals.user })
            post.user = user
            let postTags = []
            if (tags != null && tags != "") {
                postTags = await parseTags(tags)
                post.tags = postTags
            }
            await connection.manager.save(post)
            res.send({
                success: "Post successfully created."
            })
        } catch {
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

async function registerUser(permissionBlock: PermissionBlock, username, email, password, res: Response) {
    if (username.length < 30) {
        let connection = await getConnection()
        let user = await connection.manager.findOne(User, {
            where: [
                { username },
                { email }
            ]
        })
        if (!user) {
            let usernameCheck = username.match(/\w+/)
            if (usernameCheck != null) {
                if (validator.isEmail(email)) {
                    let gravatarUrl = `https://www.gravatar.com/avatar/${md5(email)}?s=200`
                    await connection.manager.save(permissionBlock)
                    await connection.manager.save(User, {
                        username,
                        email,
                        password_hash: await argon2.hash(password) as string,
                        gravatarUrl,
                        permissionBlock
                    })
                    res.send({
                        success: "User registered."
                    })
                } else {
                    res.status(400).send({
                        error: "You must submit a valid email."
                    })
                }
            } else {
                res.status(400).send({
                    error: "Username can only contain alphanumeric characters and underscores. [a-z, A-Z, 0-9, _]"
                })
            }
        } else {
            if (user.email === email) {
                res.status(400).send({
                    error: "This email is already in use. Please select a different email."
                })
            } else {
                res.status(400).send({
                    error: "User with this username already exists. Please select a different username."
                })
            }

        }
    } else {
        res.status(400).send({
            error: "Username too long (must be < 30 characters)."
        })
    }
}

// TODO: password requirements
router.post("/register", async (req, res) => {
    if (settings.registrationEnabled) {
        let permissionBlock = new PermissionBlock()
        let username: string = req.body.username
        let email = req.body.email
        let password = req.body.password
        if (username != null && email != null && password != null) {
            registerUser(permissionBlock, username, email, password, res)
        } else {
            res.status(400).send({
                error: "Missing username, email, or password."
            })
        }
    } else {
        res.status(401).send({
            error: "Registration is disabled on this blog. Sorry :("
        })
    }
})


router.post("/editpost", checkAuth, checkPermissions, async (req, res) => {
    let connection = getConnection()
    try {
        let post = await connection.manager.findOne(Post, { id: req.body.id }, { relations: ["user", "user.permissionBlock", "tags", "tags.posts"] })
        let editingUser = await connection.manager.findOne(User, { username: res.locals.user }, { relations: ["permissionBlock"] })
        if (post.user.username === res.locals.user || (editingUser.permissionBlock.permissionLevel >= 2 && editingUser.permissionBlock.permissionLevel >= post.user.permissionBlock.permissionLevel)) {
            let title = req.body.newTitle
            post.title = title
            post.content = req.body.newContent
            post.urlTitle = title.replace(/\W+/g, '-').toLowerCase()
            let newtags = await parseTags(req.body.tags) 
            let removedTags = post.tags.filter((value) => newtags.find((tag) => tag.id === value.id) === undefined)
            for (let tag of removedTags) {
                if (tag.posts.length === 1 && tag.posts[0].id === post.id) {
                    await connection.manager.remove(tag)
                }
            }
            post.tags = newtags
            await connection.manager.save(post)
            res.send({
                newUrlTitle: post.urlTitle,
                success: "Post successfully edited."
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

router.post("/deletepost", checkAuth, checkPermissions, async (req, res) => {
    let connection = getConnection()
    connection.manager.findOne(Post, { id: req.body.id }, { relations: ["user", "comments", "tags", "user.permissionBlock"] }).then(async (post) => {
        try {
            let deletingUser = await connection.manager.findOne(User, { username: res.locals.user }, { relations: ["permissionBlock"] })
            if (post.user.username === res.locals.user || (deletingUser.permissionBlock.permissionLevel >= 2 && deletingUser.permissionBlock.permissionLevel >= post.user.permissionBlock.permissionLevel)) {
                if (post.comments) {
                    await connection.manager.remove(post.comments)
                }
                for (let tag of post.tags) {
                    if (tag.posts.length === 1 && tag.posts[0].id === post.id) {
                        await connection.manager.remove(tag)
                    }
                }
                await connection.manager.remove(post)
                res.send({
                    success: "Post successfully deleted."
                })
            } else {
                res.status(401).send({
                    error: "You are not the owner of this post or you are unauthorized to delete this post."
                })
            }
        } catch {
            res.status(500).send({
                error: "Something went wrong."
            })
        }
    }).catch((err) => {
        res.status(404).send({
            error: "Post does not exist."
        })
    })
})

router.post("/deletecomment", checkAuth, checkPermissions, async (req, res) => {
    let connection = getConnection()
    let id = req.body.id
    try {
        let user = await connection.manager.findOne(User, { username: res.locals.user }, { relations: ["permissionBlock"] })
        let comment = await connection.manager.findOne(Comment, { id: id }, { relations: ["post", "user", "post.user", "user.permissionBlock"] })
        let commentUser = comment.user
        if (res.locals.user === commentUser.username || comment.post.user.username === res.locals.user || (user.permissionBlock.permissionLevel >= 3 || (user.permissionBlock.permissionLevel >= 2 && comment.user.permissionBlock.permissionLevel < 3))) {
            await connection.manager.remove(comment)
            res.send({
                success: "Comment successfully deleted."
            })
        } else {
            res.status(401).send({
                error: "You are not authorized to perform this action."
            })
        }
    } catch (err) {
        res.status(404).send({
            error: "No comment found."
        })
    }
})

router.post("/login", async (req, res) => {
    let username = req.body.username
    let password = req.body.password
    if ((username != null && username != "") && (password != null && password != "")) {
        try {
            let user = await getConnection().manager.findOne(User, { username }, { relations: ["permissionBlock"] })
            if (await argon2.verify(user.password_hash, password)) {
                let token = jwt.sign({ username }, "VERYSECRETKEY", { expiresIn: 60 * 30 })
                let age = 30 * 60 * 1000
                res.cookie("auth", token, { maxAge: age, domain: domainStr })
                let date = new Date(new Date().getTime() + age).getTime()
                res.cookie("expiration", date, { maxAge: age, domain: domainStr })
                let personalizedLoginMsg = user.permissionBlock.permissionLevel >= 3 ? "Welcome, admin :)" : ""
                res.send({
                    username,
                    canPost: user.permissionBlock.permissionLevel >= 1,
                    admin: user.permissionBlock.permissionLevel >= 3,
                    success: `You have successfully been logged in.\n${personalizedLoginMsg}`
                })
            } else {
                res.status(401).send({
                    error: "Username or password is incorrect."
                })
            }
        } catch {
            res.status(401).send({
                error: "Username or password is incorrect."
            })
        }

    } else {
        res.status(400).send({
            error: "Must include username and password in login request."
        })
    }

})

router.post("/renew-jwt", checkAuth, (req, res) => {
    let token = jwt.sign({ username: res.locals.user }, "VERYSECRETKEY", { expiresIn: 60 * 30 })
    let age = 30 * 60 * 1000
    res.cookie("auth", token, { maxAge: age, domain: domainStr })
    let date = new Date(new Date().getTime() + age).getTime()
    res.cookie("expiration", date, { maxAge: age, domain: domainStr })
    res.send({
        success: "JWT renewed"
    })
})

// Middleware function
async function checkAuth(req, res, next) {
    try {
        let token: any = jwt.verify(req.cookies["auth"], "VERYSECRETKEY")
        let user = await getConnection().manager.findOne(User, { username: token.username })
        if (user) {
            res.locals.user = token.username
            next()
        } else {
            res.status(401).send({
                error: "Authorization failed. Please log in again."
            })
        }
    } catch {
        res.status(401).send({
            error: "Authorization failed. Please log in again."
        })
    }
}

async function checkAuthLevel(req, res, next) {
    try {
        let token: any = jwt.verify(req.cookies["auth"], "VERYSECRETKEY")
        let user = await getConnection().manager.findOne(User, { username: token.username }, { relations: ["permissionBlock"] })
        if (user) {
            res.locals.permLevel = user.permissionBlock.permissionLevel
        } else {
            res.locals.permLevel = 0
        }
        next()
    } catch {
        // res.status(500).send({
        //     error: "Something went wrong on our end."
        // })
        res.locals.permLevel = 0
        next()
    }
}

let perms = new Permissions(router.stack)

// IMPORTANT NOTE: must be used AFTER and ONLY AFTER checkAuth. Cannot be used independently.
async function checkPermissions(req: Request, res, next) {
    let username = res.locals.user
    let user = await getConnection().manager.findOne(User, { username }, { relations: ["permissionBlock"] })
    let allowedAccess = perms.perms[req.route.path]
    let userPerm = user.permissionBlock.permissionLevel
    if (userPerm >= allowedAccess) {
        next()
    } else {
        res.status(401).send({
            error: "You do not have permission to perform this action."
        })
    }
}

async function processUserMentions() {

}

export = router 