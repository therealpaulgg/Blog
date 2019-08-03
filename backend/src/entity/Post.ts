import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn} from "typeorm";
import { User } from "./User";

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
    user: User;
}
