import {Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne} from "typeorm";
import { User } from "./User";

@Entity()
export class PermissionBlock {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('boolean', { default: false})
    superAdmin: boolean;

    @Column("boolean", { default: false})
    moderator: boolean;

    @Column("boolean", { default: false})
    author: boolean;

    @Column("boolean", { default: true})
    normal: boolean;

    @Column('boolean', { default: true })
    verified: boolean;

    @OneToOne(type => User, user => user.permissionBlock)
    user: User;
}
