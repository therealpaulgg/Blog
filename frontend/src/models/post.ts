import { CommentModel } from "./comment";

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
    commentCount: number;
    tags: string[];
    commentLimit: boolean;
    commentLimitVal: number;
    requiredManagePerms: boolean;
}
