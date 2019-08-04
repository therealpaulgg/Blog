import { CommentModel } from "./comment";
import moment from "moment";

export interface PostModel {
    urlTitle: string;
    title: string;
    content: string;
    username: string;
    createdAt: string;
    updatedAt: string;
    comments: CommentModel[];
}
