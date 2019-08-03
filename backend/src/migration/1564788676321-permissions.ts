import {MigrationInterface, QueryRunner} from "typeorm";

export class permissions1564788676321 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "permission_block" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "superAdmin" boolean NOT NULL DEFAULT (0), "verified" boolean NOT NULL DEFAULT (1))`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`DROP TABLE "permission_block"`);
    }

}
