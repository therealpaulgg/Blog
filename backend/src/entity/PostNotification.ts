import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn } from "typeorm"
import { User } from "./User"
import { Post } from "./Post"

@Entity()
export class PostNotification {

    @CreateDateColumn()
    createdAt: string

    @UpdateDateColumn()
    updatedAt: string

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    content: string

    @ManyToOne(type => Post, post => post.notifications)
    @JoinColumn({ name: "postid" })
    post: Post

    @ManyToOne(type => User, user => user.postNotifications)
    @JoinColumn({ name: "userid" })
    user: User
}
