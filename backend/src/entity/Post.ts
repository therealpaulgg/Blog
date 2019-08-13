import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, ManyToMany, JoinTable } from "typeorm"
import { User } from "./User"
import { Comment } from "./Comment"
import { Tag } from "./Tag"

@Entity()
export class Post {

    @CreateDateColumn()
    createdAt: string

    @UpdateDateColumn()
    updatedAt: string

    @PrimaryGeneratedColumn()
    id: number

    @Column()
    urlTitle: string

    @Column()
    title: string

    @Column()
    content: string

    @ManyToOne(type => User, user => user.posts)
    @JoinColumn({ name: "userId" })
    user: User

    @OneToMany(type => Comment, comment => comment.post)
    comments: Array<Comment>

    @ManyToMany(type => Tag, tag => tag.posts)
    @JoinTable()
    tags: Tag[]
}
