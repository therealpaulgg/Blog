import {PostNotification} from "../entity/PostNotification"
import {User} from "../entity/User"
import { Post } from "../entity/Post";
import { getConnection } from "typeorm"

export = function notify(user: User, post: Post) {
    if (post.user.username !== user.username) {
        let notification = new PostNotification()
        notification.content = `${user.username} commented on your post named ${post.title}.`
        notification.post = post
        notification.user = post.user
        getConnection().manager.save(notification)
    }
}