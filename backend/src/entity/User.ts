import {Entity, PrimaryGeneratedColumn, Column, OneToMany} from "typeorm";
import { Post } from "./Post";

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

    addPost(post: Post) {
        if (!this.posts) this.posts = []
        this.posts.push(post);
    }
}
