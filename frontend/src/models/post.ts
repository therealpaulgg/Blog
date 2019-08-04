import { CommentModel } from "./comment";

export interface PostModel {
    urlTitle: string;
    title: string;
    content: string;
    username: string;
    createdAt: any;
    updatedAt: any;
    comments: CommentModel[];
}
