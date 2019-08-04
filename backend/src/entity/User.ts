import {Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne} from "typeorm";
import { Post } from "./Post";
import { Comment } from "./Comment";
import { PermissionBlock } from "./PermissionBlock";

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    username: string;

    @Column()
    email: string;

    @Column()
    password_hash: string;

    @OneToMany(type => Post, post => post.user)
    posts: Array<Post>

    @OneToMany(type => Comment, comment => comment.user)
    comments: Array<Comment>

    @OneToOne(type => PermissionBlock, permissionBlock => permissionBlock.user)
    permissionBlock: PermissionBlock

    addPost(post: Post) {
        if (!this.posts) this.posts = []
        this.posts.push(post);
    }
}
