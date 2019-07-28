import {MigrationInterface, QueryRunner} from "typeorm";

export class newmigration1564300482835 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "post" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "url_title" varchar NOT NULL, "title" varchar NOT NULL, "content" varchar NOT NULL)`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "post"`);
    }

}
