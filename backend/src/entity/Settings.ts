import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm"

@Entity()
export class Settings {

    @CreateDateColumn()
    createdAt: string

    @UpdateDateColumn()
    updatedAt: string

    @PrimaryGeneratedColumn()
    id: number

    @Column({default: false})
    limitPostTitleLength: boolean

    @Column({ default: 100 })
    postTitleMaxLength: number

    @Column({default: true})
    registrationEnabled: boolean

    @Column({default: true})
    limitCommentLength: boolean

    @Column({ default: 2000 })
    commentMaxLength: number
}
