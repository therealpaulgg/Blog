import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany, JoinColumn, ManyToMany, JoinTable } from "typeorm"
import { User } from "./User"
import { Comment } from "./Comment"
import { Tag } from "./Tag"
import { PostNotification } from "./PostNotification";

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

    @Column({default: "public"})
    visibility: string

    @Column({nullable: true})
    sharableUrlToken: string

    @Column({default: true})
    editable: boolean

    @Column({default: true, nullable: true})
    commentsEnabled: boolean

    @ManyToOne(type => User, user => user.posts)
    @JoinColumn({ name: "userId" })
    user: User

    @ManyToMany(type => User, user => user.authorizedPosts)
    @JoinTable()
    authorizedUsers: User[]

    @OneToMany(type => Comment, comment => comment.post)
    comments: Array<Comment>
    
    @OneToMany(type => PostNotification, notification => notification.post)
    notifications: Array<PostNotification>

    @ManyToMany(type => Tag, tag => tag.posts)
    @JoinTable()
    tags: Tag[]
}
