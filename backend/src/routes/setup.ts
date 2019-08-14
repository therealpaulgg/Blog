import { router } from "../routes"
import { getConnection } from "typeorm"
import { PermissionBlock } from "../entity/PermissionBlock"
import { registerUser } from "./authentication"

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