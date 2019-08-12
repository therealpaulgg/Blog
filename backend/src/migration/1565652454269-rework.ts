import {MigrationInterface, QueryRunner} from "typeorm";

export class rework1565652454269 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "temporary_permission_block" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "verified" boolean NOT NULL DEFAULT (1))`);
        await queryRunner.query(`INSERT INTO "temporary_permission_block"("id", "verified") SELECT "id", "verified" FROM "permission_block"`);
        await queryRunner.query(`DROP TABLE "permission_block"`);
        await queryRunner.query(`ALTER TABLE "temporary_permission_block" RENAME TO "permission_block"`);
        await queryRunner.query(`CREATE TABLE "temporary_permission_block" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "verified" boolean NOT NULL DEFAULT (1), "permissionLevel" integer NOT NULL DEFAULT (0))`);
        await queryRunner.query(`INSERT INTO "temporary_permission_block"("id", "verified") SELECT "id", "verified" FROM "permission_block"`);
        await queryRunner.query(`DROP TABLE "permission_block"`);
        await queryRunner.query(`ALTER TABLE "temporary_permission_block" RENAME TO "permission_block"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "permission_block" RENAME TO "temporary_permission_block"`);
        await queryRunner.query(`CREATE TABLE "permission_block" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "verified" boolean NOT NULL DEFAULT (1))`);
        await queryRunner.query(`INSERT INTO "permission_block"("id", "verified") SELECT "id", "verified" FROM "temporary_permission_block"`);
        await queryRunner.query(`DROP TABLE "temporary_permission_block"`);
        await queryRunner.query(`ALTER TABLE "permission_block" RENAME TO "temporary_permission_block"`);
        await queryRunner.query(`CREATE TABLE "permission_block" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "superAdmin" boolean NOT NULL DEFAULT (0), "moderator" boolean NOT NULL DEFAULT (0), "author" boolean NOT NULL DEFAULT (0), "normal" boolean NOT NULL DEFAULT (1), "verified" boolean NOT NULL DEFAULT (1))`);
        await queryRunner.query(`INSERT INTO "permission_block"("id", "verified") SELECT "id", "verified" FROM "temporary_permission_block"`);
        await queryRunner.query(`DROP TABLE "temporary_permission_block"`);
    }

}
