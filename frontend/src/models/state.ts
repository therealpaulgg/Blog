import { PostModel } from "./post"
import { Alert } from "./alert"
import { PostNotificationModel } from "./notification"

export interface State {
    theme: string
    authenticated: boolean
    posts: PostModel[]
    content: string
    commentContent: string
    postTitle: string
    alert: Alert
    editContent: string
    editPostTitle: string
    username: string
    pages: number
    canPost: boolean
    isAdmin: boolean
    tags: string
    tagPosts: PostModel[]
    tagPages: number
    notificationCount: number
    notifications: PostNotificationModel[]
    notificationPages: number
    showingCommentDropdown: boolean
}
