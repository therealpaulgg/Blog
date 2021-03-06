import { getConnection } from "typeorm"
import { Settings } from "../entity/Settings"

export class SettingsService {
    limitPostTitleLength: boolean
    postTitleMaxLength: number
    registrationEnabled: boolean
    limitCommentLength: boolean
    commentMaxLength: number
    blogTitle: string

    constructor() {
        // Any route which has not explicitly set permissions will be assumed to be 'normal'.
        // Not all routes need to be manually set!
        // this.asyncConstruct()
    }

    private async asyncConstruct() {
        let connection = getConnection()
        let settings = await connection.manager.findOne(Settings)
        if (settings == null) {
            settings = new Settings()
            await connection.manager.save(settings)
        } 
        this.limitPostTitleLength = settings.limitPostTitleLength
        this.postTitleMaxLength = settings.postTitleMaxLength
        this.registrationEnabled = settings.registrationEnabled
        this.limitCommentLength = settings.limitCommentLength
        this.commentMaxLength = settings.commentMaxLength
        this.blogTitle = settings.blogTitle
    }   // add getter and setter methods

    public async reloadSettings() {
        await this.asyncConstruct()
    }

    public async newSettings(settingsObj) {
        let connection = getConnection()
        let settings = await connection.manager.findOne(Settings)
        settings.limitPostTitleLength = this.limitPostTitleLength = settingsObj.limitPostTitleLength
        settings.postTitleMaxLength = this.postTitleMaxLength = settingsObj.postTitleMaxLength
        settings.registrationEnabled = this.registrationEnabled = settingsObj.registrationEnabled
        settings.limitCommentLength = this.limitCommentLength = settingsObj.limitCommentLength
        settings.commentMaxLength = this.commentMaxLength = settingsObj.commentMaxLength
        settings.blogTitle = this.blogTitle = settingsObj.blogTitle
        await connection.manager.save(settings)
    }
}