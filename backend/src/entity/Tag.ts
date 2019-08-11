import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany } from "typeorm";
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

    @ManyToMany(type => Post)
    posts: Post[]
}
