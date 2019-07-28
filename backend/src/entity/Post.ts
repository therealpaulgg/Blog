import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

@Entity()
export class Post {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    url_title: string;

    @Column()
    title: string;

    @Column()
    content: string;
}
