import { PostModel } from "./post";
import { Alert } from "./alert";

export interface State {
    theme: string;
    authenticated: boolean;
    posts: PostModel[];
    content: string;
    commentContent: string;
    postTitle: string;
    alert: Alert;
    editContent: string;
    editPostTitle: string;
    username: string;
    pages: number;
    canPost: boolean;
    isAdmin: boolean;
}
