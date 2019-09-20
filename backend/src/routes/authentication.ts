import { router, settings } from "../routes"
import { checkAuth } from "../middleware/middleware"
import { getConnection } from "typeorm"
import jwt from "jsonwebtoken"
import { User } from "../entity/User"
import { PermissionBlock } from "../entity/PermissionBlock"
import argon2 from "argon2"
import { Response } from "express"
import validator from "validator"
import md5 from "md5"
import Mail from "../services/mail"
import rateLimit from "express-rate-limit"

const COOKIE_EXPIRE_TIME = 60 * 30

let domainStr = ""
if (process.env.ENVIRONMENT === "prod") {
    domainStr = "blog.paulgellai.dev"
} else if (process.env.ENVIRONMENT === "staging") {
    domainStr = "test.blog.paulgellai.dev"
} else {
    domainStr = "localhost"
}

export async function registerUser(permissionBlock: PermissionBlock, username, email, password, res: Response) {
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

// if user has all permission fields, should return the highest one
export function getPermStr(perm: PermissionBlock | number) {
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

router.get("/usermetadata", checkAuth, async (req, res) => {
    try {
        let connection = getConnection()
        let user = await connection.manager.findOne(User, { username: res.locals.user }, { relations: ["permissionBlock"] })
        let foo = {
            canPost: user.permissionBlock.permissionLevel >= 1,
            isAdmin: user.permissionBlock.permissionLevel >= 3,
            username: user.username
        } 
        res.send(foo)
    } catch {
        res.status(500).send({
            error: "Something went wrong."
        })
    }
})

router.get("/resetpassword/:token", (req, res) => {
    let token = req.params.token
    if (token != null) {
        try {
            let contents: any = jwt.verify(token, process.env.SECRET_KEY)
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

const generalRateLimit = new rateLimit({
    windowMs: 60 * 10 * 1000,
    max: 20,
    message: {status: 429, message: "", error: "Too many requests have been made from this IP address. Please try again in 10 minutes."}
})

router.post("/resetpassword/:token", generalRateLimit, async (req, res) => {
    let token = req.params.token
    let password = req.body.password
    if (token != null) {
        if (password != null) {
            try {
                let contents: any = jwt.verify(token, process.env.SECRET_KEY)
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

router.post("/resetpasswordreq", generalRateLimit, async (req, res) => {
    let email = req.body.email
    if (email != null) {
        try {
            let user = await getConnection().manager.findOne(User, { email: req.body.email })
            if (user != null) {
                Mail.to = user.email
                let token = jwt.sign({
                    username: user.username,
                    email: user.email,
                }, process.env.SECRET_KEY, { expiresIn: COOKIE_EXPIRE_TIME })
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

router.post("/changepassword", generalRateLimit, checkAuth, async (req, res) => {
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


router.post("/changeemail", generalRateLimit, checkAuth, async (req, res) => {
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


const registerLimit = new rateLimit({
    windowMs: 60 * 10 * 1000,
    max: 20,
    message: {tatus: 429, message: "", error: "Too many register requests have been made from this IP address. Please try again in 10 minutes."}
})

// TODO: password requirements
router.post("/register", registerLimit, async (req, res) => {
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

const loginLimit = new rateLimit({
    windowMs: 60 * 10 * 1000,
    max: 20,
    message: {status: 429, message: "", error: "Too many login requests have been made from this IP address. Please try again in 10 minutes."}
})

router.post("/login", loginLimit, async (req, res) => {
    let username = req.body.username
    let password = req.body.password
    if ((username != null && username != "") && (password != null && password != "")) {
        try {
            let user = await getConnection().manager.findOne(User, { username }, { relations: ["permissionBlock"] })
            if (await argon2.verify(user.password_hash, password)) {
                let token = jwt.sign({ username }, process.env.SECRET_KEY, { expiresIn: COOKIE_EXPIRE_TIME })
                let age = COOKIE_EXPIRE_TIME * 1000
                res.cookie("auth", token, { maxAge: age, domain: domainStr, sameSite: true })
                let date = new Date(new Date().getTime() + age).getTime()
                res.cookie("expiration", date, { maxAge: age, domain: domainStr, sameSite: true })
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
    let token = jwt.sign({ username: res.locals.user }, process.env.SECRET_KEY, { expiresIn: COOKIE_EXPIRE_TIME })
    let age = COOKIE_EXPIRE_TIME * 1000
    res.cookie("auth", token, { maxAge: age, domain: domainStr, sameSite: true })
    let date = new Date(new Date().getTime() + age).getTime()
    res.cookie("expiration", date, { maxAge: age, domain: domainStr, sameSite: true })
    res.send({
        success: "JWT renewed"
    })
})