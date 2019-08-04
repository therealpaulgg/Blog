import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn } from "typeorm";
import { User } from "./User";
import { Comment } from "./Comment";

@Entity()
export class Post {

    @CreateDateColumn()
    createdAt: string

    @UpdateDateColumn()
    updatedAt: string

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    urlTitle: string;

    @Column()
    title: string;

    @Column()
    content: string;

    @ManyToOne(type => User, user => user.posts)
    @JoinColumn({ name: "userId"})
    user: User;

    @OneToMany(type => Comment, comment => comment.post)
    comments: Array<Comment>
}
