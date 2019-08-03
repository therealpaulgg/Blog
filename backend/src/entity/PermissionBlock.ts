import {Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne} from "typeorm";
import { User } from "./User";

@Entity()
export class PermissionBlock {

    @PrimaryGeneratedColumn()
    id: number;

    @Column('boolean', { default: false})
    superAdmin: boolean

    @Column('boolean', { default: true })
    verified: boolean

    @OneToOne(type => User, user => user.permissionBlock)
    user: User
}
