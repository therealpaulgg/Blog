import { router, settings } from "../routes"
import { checkAuth, checkPermissions } from "../middleware/middleware"
import { getConnection } from "typeorm"
import { User } from "../entity/User"
import { getPermStr } from "./authentication"
import { deletePost, deleteComment } from "./content-creation"

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

router.get("/administration/:page", checkAuth, checkPermissions, async (req, res) => {
    let page = parseInt(req.params.page)
    if (!isNaN(page)) {
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

router.post("/admindeleteuser/:username", checkAuth, checkPermissions, async (req, res) => {
    let username = req.params.username
    if (username != null) {
        try {
            let connection = getConnection()
            let user = await connection.manager.findOne(User, { username }, { relations: ["comments", "posts", "permissionBlock"] })
            if (user != null) {
                // delete all user comments
                for (let comment of user.comments) {
                    await deleteComment(comment.id, user, true)
                }
                // delete all user posts 
                for (let post of user.posts) {
                    await deletePost(post.id, user, true)
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
            if (err.responseId != null && err.responseContent != null) {
                res.status(err.responseId).send({
                    error: err.responseContent
                })
            } else {
                res.status(500).send({
                    error: "Something went wrong."
                })
            }
        }
    } else {
        res.status(400).send({
            error: "Invalid username field."
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


router.get("/settingdata", checkAuth, checkPermissions, async (req, res) => {
    settings.reloadSettings()
    res.send({
        limitCommentLength: settings.limitCommentLength,
        commentMaxLength: settings.commentMaxLength,
        limitPostTitleLength: settings.limitPostTitleLength,
        postTitleMaxLength: settings.postTitleMaxLength,
        registrationEnabled: settings.registrationEnabled,
        blogTitle: settings.blogTitle
    })
})

router.post("/settingdata", checkAuth, checkPermissions, async (req, res) => {
    if (req.body.limitCommentLength != null &&
        req.body.commentMaxLength != null &&
        req.body.limitPostTitleLength != null &&
        req.body.postTitleMaxLength != null &&
        req.body.registrationEnabled != null &&
        req.body.blogTitle != null &&
        req.body.blogTitle.length > 0 &&
        req.body.blogTitle.length < 30) {
        await settings.newSettings(req.body)
        res.send({
            success: "Settings updated. Some settings may not be visible until a page refresh is done."
        })
    } else {
        res.status(400).send({
            error: "Malformed request."
        })
    }
})
