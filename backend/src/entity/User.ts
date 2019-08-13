import {Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn} from "typeorm"
import { Post } from "./Post"
import { Comment } from "./Comment"
import { PermissionBlock } from "./PermissionBlock"

@Entity()
export class User {

    @PrimaryGeneratedColumn()
    id: number

    @CreateDateColumn()
    createdAt: string

    @UpdateDateColumn()
    updatedAt: string

    @Column()
    username: string

    @Column()
    email: string

    @Column()
    password_hash: string

    @Column()
    gravatarUrl: string

    @Column({nullable: true})
    bio: string

    @OneToMany(type => Post, post => post.user)
    posts: Array<Post>

    @OneToMany(type => Comment, comment => comment.user)
    comments: Array<Comment>

    @OneToOne(type => PermissionBlock, permissionBlock => permissionBlock.user)
    @JoinColumn()
    permissionBlock: PermissionBlock

    addPost(post: Post) {
        if (!this.posts) this.posts = []
        this.posts.push(post)
    }
}
