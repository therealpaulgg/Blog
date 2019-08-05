import { CommentModel } from "./comment";
import moment from "moment";

export interface PostModel {
    postId: number;
    urlTitle: string;
    title: string;
    content: string;
    username: string;
    createdAt: string;
    updatedAt: string;
    comments: CommentModel[];
    pages: number;
}
