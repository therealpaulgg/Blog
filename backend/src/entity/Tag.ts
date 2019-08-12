import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from "typeorm";
import { Post } from "./Post";

@Entity()
export class Tag {

    @CreateDateColumn()
    createdAt: string

    @UpdateDateColumn()
    updatedAt: string

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    tagStr: string;

    @ManyToMany(type => Post, post => post.tags, {
        eager: true
    })
    posts: Post[]
}
