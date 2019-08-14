import express from "express"
import { createConnection } from "typeorm"
import { SettingsService } from "./services/settings"

export let settings: SettingsService | null = null
// must be done in same scope as app
createConnection().then(() => settings = new SettingsService())

import { Permissions } from "./services/permissions"

export let router = express.Router()

export let perms = new Permissions()

import "./routes/administration"
import "./routes/authentication"
import "./routes/content-creation"
import "./routes/content"
import "./routes/root"
import "./routes/profile"
import "./routes/setup"