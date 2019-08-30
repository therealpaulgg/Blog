import { router, settings } from "../routes"
import { checkAuth, checkPermissions } from "../middleware/middleware"
import { getConnection } from "typeorm"
import { User } from "../entity/User"
import { Post } from "../entity/Post"
import { Tag } from "../entity/Tag"
import { Comment } from "../entity/Comment"
import notify from "../services/notify"
import { parentPort } from "worker_threads";

export async function deletePost(postId: string | number | Post, username: string | User, override?: boolean) {
    let connection = getConnection()
    let post = null
    let id = 0
    if (postId instanceof Post) {
        post = postId
    } else if (Number(postId)) {
        id = Number(postId)
    } else {
        id = parseInt(String(postId))
    }
    if (!isNaN(id)) {
        try {
            if (post == null) {
                post = await connection.manager.findOne(Post, { id }, { relations: ["user", "comments", "tags", "user.permissionBlock"] })
            }
            if (post != null) {
                let deletingUser = null
                if (username instanceof User) {
                    deletingUser = username
                } else {
                    await connection.manager.findOne(User, { username }, { relations: ["permissionBlock"] })
                }
                if (override || post.user.username === username || (deletingUser.permissionBlock.permissionLevel >= 2 && deletingUser.permissionBlock.permissionLevel >= post.user.permissionBlock.permissionLevel)) {
                    if (post.comments) {
                        await connection.manager.remove(post.comments)
                    }
                    for (let tag of post.tags) {
                        if (tag.posts.length === 1 && tag.posts[0].id === post.id) {
                            await connection.manager.remove(tag)
                        }
                    }
                    await connection.manager.remove(post)
                    return [200, "Successfully deleted post."]
                } else {
                    throw {
                        responseId: 401,
                        responseContent: "You are not the owner of this post or you are unauthorized to delete this post."
                    }
                }
            } else {
                throw {
                    responseId: 404,
                    responseContent: "Post does not exist."
                }
            }
        } catch (err) {
            if (err.responseId != null && err.responseContent != null) {
                throw {
                    responseId: err.responseId,
                    responseContent: err.responseContent
                }
            } else {
                throw {
                    responseId: 500,
                    responseContent: "Something went wrong."
                }
            }
        }
    } else {
        throw {
            responseId: 400,
            responseContent: "A proper post ID must be included in your request."
        }
    }
}

export async function deleteComment(commentId: number, username: string | User, override?: boolean) {
    let connection = getConnection()
    let comment: Comment | null = null
    if (!isNaN(commentId)) {
        try {
            comment = await connection.manager.findOne(Comment, { id: commentId }, { relations: ["post", "user", "post.user", "user.permissionBlock", "children", "parent", "parent.user"] })
            if (comment != null) {
                let user = null
                if (username instanceof User) {
                    user = username
                } else {
                    user = await connection.manager.findOne(User, { username }, { relations: ["permissionBlock"] })
                }
                let commentUser = comment.user
                if (!override && commentUser == null) {
                    throw {
                        responseId: 401,
                        responseContent: "You may not directly delete a comment marked as deleted."
                    }
                }
                // permissions check
                if (override || username === commentUser.username || comment.post.user.username === username || (user.permissionBlock.permissionLevel >= 3 || (user.permissionBlock.permissionLevel >= 2 && comment.user.permissionBlock.permissionLevel < 3))) {
                    if (comment.children.length > 0) {
                        comment.content = "[deleted]"
                        comment.user = null
                        await connection.manager.save(comment)
                    } else {
                        let parent = comment.parent
                        await connection.manager.remove(comment)
                        if (parent != null && parent.content == "[deleted]" && parent.user == null) {
                            // recursion is cool!
                            await deleteComment(parent.id, parent.user, true)
                        }
                    }
                } else {
                    throw {
                        responseId: 401,
                        responseContent: "You are not authorized to perform this action."
                    }
                }
            } else {
                throw {
                    responseId: 404,
                    responseContent: "No comment found."
                }
            }
        } catch (err) {
            if (err.responseId != null && err.responseContent != null) {
                throw {
                    responseId: err.responseId,
                    responseContent: err.responseContent
                }
            } else {
                console.log(err)
                throw {
                    responseId: 500,
                    responseContent: "Something went wrong."
                }
            }
        }
    } else {
        throw {
            responseId: 400,
            responseContent: "A proper comment ID must be included in your request."
        }
    }
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

// Posts a comment (anyone can do this, need to use recaptcha in future or disable registration)
router.post("/comment", checkAuth, checkPermissions, async (req, res) => {
    // Data should be sent through body
    try {
        let connection = getConnection()
        let post = await connection.manager.findOne(Post, { id: req.body.id, urlTitle: req.body.urlTitle }, { relations: ["user"] })
        let user = await connection.manager.findOne(User, { username: res.locals.user })
        if (post && user) {
            let content: string = req.body.content
            let replyId: number = req.body.replyId
            if (content != null && content.length > 0 && ((!settings.limitCommentLength) || (content.length <= settings.commentMaxLength && settings.limitCommentLength))) {
                let comment = new Comment()
                comment.post = post
                comment.content = content
                comment.user = user
                if (replyId != null) {
                    comment.parent = await connection.manager.findOne(Comment, { id: replyId }, { relations: ["user"] })
                    if (comment.parent.user == null) {
                        res.status(400).send({
                            error: "You cannot reply to a comment marked as deleted."
                        })
                    }
                }
                await connection.manager.save(comment)
                res.send({
                    success: "Comment posted."
                })
                notify(user, post)
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
    } catch (err) {
        console.log(err)
        res.status(400).send({
            error: "Malformed request."
        })
    }
})

router.post("/editpost-settings", checkAuth, checkPermissions, async (req, res) => {
    let connection = getConnection()
    try {
        let post = await connection.manager.findOne(Post, { id: req.body.id }, { relations: ["user", "user.permissionBlock", "tags", "tags.posts"] })
        let editingUser = await connection.manager.findOne(User, { username: res.locals.user }, { relations: ["permissionBlock"] })
        if (post.user.username === res.locals.user || (editingUser.permissionBlock.permissionLevel >= 2 && editingUser.permissionBlock.permissionLevel >= post.user.permissionBlock.permissionLevel)) {
            post.editable = req.body.editable
            post.commentsEnabled = req.body.commentsEnabled
            await connection.manager.save(post)
            res.send({
                newUrlTitle: post.urlTitle,
                success: "Post settings successfully edited."
            })
        } else {
            res.status(401).send({
                error: "You are not the owner of this post."
            })
        }
    } catch (err) {
        console.log(err)
        res.status(400).send({
            error: "Bad request."
        })
    }
})


router.post("/editpost", checkAuth, checkPermissions, async (req, res) => {
    let connection = getConnection()
    try {
        let post = await connection.manager.findOne(Post, { id: req.body.id }, { relations: ["user", "user.permissionBlock", "tags", "tags.posts"] })
        let editingUser = await connection.manager.findOne(User, { username: res.locals.user }, { relations: ["permissionBlock"] })
        if (post.user.username === res.locals.user || (editingUser.permissionBlock.permissionLevel >= 2 && editingUser.permissionBlock.permissionLevel >= post.user.permissionBlock.permissionLevel)) {
            if (post.editable || editingUser.permissionBlock.permissionLevel >= 2) {
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
                res.status(400).send({
                    error: "This post is not editable."
                })
            }
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
    try {
        await deletePost(req.body.id, res.locals.user)
        res.send({
            success: "Post successfully deleted."
        })
    } catch (err) {
        res.status(err.responseId).send({
            error: err.responseContent
        })
    }
})

router.post("/deletecomment", checkAuth, checkPermissions, async (req, res) => {
    let id = parseInt(req.body.id)
    try {
        await deleteComment(id, res.locals.user)
        res.send({
            success: "Comment successfully deleted."
        })
    } catch (err) {
        res.status(err.responseId).send({
            error: err.responseContent
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