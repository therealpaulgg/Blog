import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn } from "typeorm"
import { User } from "./User"
import { Post } from "./Post"

@Entity()
export class Comment {

    @CreateDateColumn()
    createdAt: string

    @UpdateDateColumn()
    updatedAt: string

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    content: string

    @ManyToOne(type => User, user => user.comments, { nullable: true })
    @JoinColumn({ name: "userid" })
    user: User

    @ManyToOne(type => Post, post => post.comments)
    post: Post

    @ManyToOne(type => Comment, comment => comment.children, { nullable: true })
    parent: Comment

    @OneToMany(type => Comment, comment => comment.parent, { nullable: true })
    children: Array<Comment>

}
