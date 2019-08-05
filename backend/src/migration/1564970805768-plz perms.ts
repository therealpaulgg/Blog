import {MigrationInterface, QueryRunner} from "typeorm";

export class plzPerms1564970805768 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "post" ("createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "urlTitle" varchar NOT NULL, "title" varchar NOT NULL, "content" varchar NOT NULL, "userId" integer)`);
        await queryRunner.query(`CREATE TABLE "permission_block" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "superAdmin" boolean NOT NULL DEFAULT (0), "verified" boolean NOT NULL DEFAULT (1))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "username" varchar NOT NULL, "email" varchar NOT NULL, "password_hash" varchar NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "comment" ("createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" varchar NOT NULL, "userid" integer, "postId" integer)`);
        await queryRunner.query(`CREATE TABLE "temporary_post" ("createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "urlTitle" varchar NOT NULL, "title" varchar NOT NULL, "content" varchar NOT NULL, "userId" integer, CONSTRAINT "FK_5c1cf55c308037b5aca1038a131" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_post"("createdAt", "updatedAt", "id", "urlTitle", "title", "content", "userId") SELECT "createdAt", "updatedAt", "id", "urlTitle", "title", "content", "userId" FROM "post"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`ALTER TABLE "temporary_post" RENAME TO "post"`);
        await queryRunner.query(`CREATE TABLE "temporary_comment" ("createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" varchar NOT NULL, "userid" integer, "postId" integer, CONSTRAINT "FK_d6139c3f5f3069f0269e1e48f69" FOREIGN KEY ("userid") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION, CONSTRAINT "FK_94a85bb16d24033a2afdd5df060" FOREIGN KEY ("postId") REFERENCES "post" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_comment"("createdAt", "updatedAt", "id", "content", "userid", "postId") SELECT "createdAt", "updatedAt", "id", "content", "userid", "postId" FROM "comment"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`ALTER TABLE "temporary_comment" RENAME TO "comment"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "comment" RENAME TO "temporary_comment"`);
        await queryRunner.query(`CREATE TABLE "comment" ("createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "content" varchar NOT NULL, "userid" integer, "postId" integer)`);
        await queryRunner.query(`INSERT INTO "comment"("createdAt", "updatedAt", "id", "content", "userid", "postId") SELECT "createdAt", "updatedAt", "id", "content", "userid", "postId" FROM "temporary_comment"`);
        await queryRunner.query(`DROP TABLE "temporary_comment"`);
        await queryRunner.query(`ALTER TABLE "post" RENAME TO "temporary_post"`);
        await queryRunner.query(`CREATE TABLE "post" ("createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "urlTitle" varchar NOT NULL, "title" varchar NOT NULL, "content" varchar NOT NULL, "userId" integer)`);
        await queryRunner.query(`INSERT INTO "post"("createdAt", "updatedAt", "id", "urlTitle", "title", "content", "userId") SELECT "createdAt", "updatedAt", "id", "urlTitle", "title", "content", "userId" FROM "temporary_post"`);
        await queryRunner.query(`DROP TABLE "temporary_post"`);
        await queryRunner.query(`DROP TABLE "comment"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "permission_block"`);
        await queryRunner.query(`DROP TABLE "post"`);
    }

}
