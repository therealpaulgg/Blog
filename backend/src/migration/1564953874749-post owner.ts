import {MigrationInterface, QueryRunner} from "typeorm";

export class postOwner1564953874749 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "temporary_post" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "urlTitle" varchar NOT NULL, "title" varchar NOT NULL, "content" varchar NOT NULL, "userId" integer, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "temporary_post"("id", "urlTitle", "title", "content", "userId", "createdAt", "updatedAt") SELECT "id", "urlTitle", "title", "content", "userId", "createdAt", "updatedAt" FROM "post"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`ALTER TABLE "temporary_post" RENAME TO "post"`);
        await queryRunner.query(`CREATE TABLE "temporary_post" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "urlTitle" varchar NOT NULL, "title" varchar NOT NULL, "content" varchar NOT NULL, "userid" integer, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "temporary_post"("id", "urlTitle", "title", "content", "userid", "createdAt", "updatedAt") SELECT "id", "urlTitle", "title", "content", "userId", "createdAt", "updatedAt" FROM "post"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`ALTER TABLE "temporary_post" RENAME TO "post"`);
        await queryRunner.query(`CREATE TABLE "temporary_post" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "urlTitle" varchar NOT NULL, "title" varchar NOT NULL, "content" varchar NOT NULL, "userid" integer, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_c9a65a5c8a51ceaa19e4b1a5352" FOREIGN KEY ("userid") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_post"("id", "urlTitle", "title", "content", "userid", "createdAt", "updatedAt") SELECT "id", "urlTitle", "title", "content", "userid", "createdAt", "updatedAt" FROM "post"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`ALTER TABLE "temporary_post" RENAME TO "post"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "post" RENAME TO "temporary_post"`);
        await queryRunner.query(`CREATE TABLE "post" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "urlTitle" varchar NOT NULL, "title" varchar NOT NULL, "content" varchar NOT NULL, "userid" integer, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "post"("id", "urlTitle", "title", "content", "userid", "createdAt", "updatedAt") SELECT "id", "urlTitle", "title", "content", "userid", "createdAt", "updatedAt" FROM "temporary_post"`);
        await queryRunner.query(`DROP TABLE "temporary_post"`);
        await queryRunner.query(`ALTER TABLE "post" RENAME TO "temporary_post"`);
        await queryRunner.query(`CREATE TABLE "post" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "urlTitle" varchar NOT NULL, "title" varchar NOT NULL, "content" varchar NOT NULL, "userId" integer, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')))`);
        await queryRunner.query(`INSERT INTO "post"("id", "urlTitle", "title", "content", "userId", "createdAt", "updatedAt") SELECT "id", "urlTitle", "title", "content", "userid", "createdAt", "updatedAt" FROM "temporary_post"`);
        await queryRunner.query(`DROP TABLE "temporary_post"`);
        await queryRunner.query(`ALTER TABLE "post" RENAME TO "temporary_post"`);
        await queryRunner.query(`CREATE TABLE "post" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "urlTitle" varchar NOT NULL, "title" varchar NOT NULL, "content" varchar NOT NULL, "userId" integer, "createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), CONSTRAINT "FK_5c1cf55c308037b5aca1038a131" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "post"("id", "urlTitle", "title", "content", "userId", "createdAt", "updatedAt") SELECT "id", "urlTitle", "title", "content", "userId", "createdAt", "updatedAt" FROM "temporary_post"`);
        await queryRunner.query(`DROP TABLE "temporary_post"`);
    }

}
