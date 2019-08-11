export interface CommentModel {
    content: string;
    user: string;
    createdAt: string;
    updatedAt: string;
    id: number;
    postId: number | undefined;
    postUrlTitle: string | undefined;
}
