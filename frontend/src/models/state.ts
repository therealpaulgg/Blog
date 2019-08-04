import { PostModel } from "./post";
import { Alert } from "./alert";

export interface State {
    theme: string;
    authenticated: boolean;
    posts: PostModel[];
    content: string;
    commentContent: string;
    postTitle: string;
    alerts: Alert[];
}
