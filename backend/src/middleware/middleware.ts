import { getConnection } from "typeorm"
import jwt from "jsonwebtoken"
import { User } from "../entity/User"
import { perms } from "../routes"

// Middleware function
export async function checkAuth(req, res, next) {
    try {
        console.log(req.cookies)
        let token: any = jwt.verify(req.cookies["auth"], process.env.SECRET_KEY)
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

export async function checkAuthBool(cookie) {
    try {
        let token: any = jwt.verify(cookie, process.env.SECRET_KEY)
        let user = await getConnection().manager.findOne(User, { username: token.username }, {relations: ["permissionBlock"]})
        if (user) {
            return {
                auth: true, 
                user
            }
        } else {
            return {
                auth: false, 
                user: null
            }
        }
    } catch {
        return {
            auth: false, 
            user: null
        }
    }
}

export async function checkAuthLevel(req, res, next) {
    try {
        let token: any = jwt.verify(req.cookies["auth"], process.env.SECRET_KEY)
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



// IMPORTANT NOTE: must be used AFTER and ONLY AFTER checkAuth. Cannot be used independently.
export async function checkPermissions(req, res, next) {
    let username = res.locals.user
    let user = await getConnection().manager.findOne(User, { username }, { relations: ["permissionBlock"] })
    let allowedAccess = perms.perms[req.route.path]
    let userPerm = user.permissionBlock.permissionLevel
    if (userPerm >= allowedAccess || allowedAccess == null) {
        next()
    } else {
        res.status(401).send({
            error: "You do not have permission to perform this action."
        })
    }
}