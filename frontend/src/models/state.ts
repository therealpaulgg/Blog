import { PostModel } from "./post";

export interface State {
    theme: string;
    authenticated: boolean;
    posts: PostModel[];
    content: string;
    commentContent: string;
}
