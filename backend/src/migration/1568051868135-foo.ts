import {MigrationInterface, QueryRunner} from "typeorm";

export class foo1568051868135 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`CREATE TABLE "temporary_post" ("createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "urlTitle" varchar NOT NULL, "title" varchar NOT NULL, "content" varchar NOT NULL, "userId" integer, "editable" boolean NOT NULL DEFAULT (1), "commentsEnabled" boolean NOT NULL DEFAULT (1), "visibility" varchar NOT NULL, CONSTRAINT "FK_5c1cf55c308037b5aca1038a131" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_post"("createdAt", "updatedAt", "id", "urlTitle", "title", "content", "userId", "editable", "commentsEnabled", "visibility") SELECT "createdAt", "updatedAt", "id", "urlTitle", "title", "content", "userId", "editable", "commentsEnabled", "visibility" FROM "post"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`ALTER TABLE "temporary_post" RENAME TO "post"`);
        await queryRunner.query(`CREATE TABLE "temporary_post" ("createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "urlTitle" varchar NOT NULL, "title" varchar NOT NULL, "content" varchar NOT NULL, "userId" integer, "editable" boolean NOT NULL DEFAULT (1), "commentsEnabled" boolean DEFAULT (1), "visibility" varchar NOT NULL DEFAULT ('public'), CONSTRAINT "FK_5c1cf55c308037b5aca1038a131" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_post"("createdAt", "updatedAt", "id", "urlTitle", "title", "content", "userId", "editable", "commentsEnabled", "visibility") SELECT "createdAt", "updatedAt", "id", "urlTitle", "title", "content", "userId", "editable", "commentsEnabled", "visibility" FROM "post"`);
        await queryRunner.query(`DROP TABLE "post"`);
        await queryRunner.query(`ALTER TABLE "temporary_post" RENAME TO "post"`);
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "post" RENAME TO "temporary_post"`);
        await queryRunner.query(`CREATE TABLE "post" ("createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "urlTitle" varchar NOT NULL, "title" varchar NOT NULL, "content" varchar NOT NULL, "userId" integer, "editable" boolean NOT NULL DEFAULT (1), "commentsEnabled" boolean NOT NULL DEFAULT (1), "visibility" varchar NOT NULL, CONSTRAINT "FK_5c1cf55c308037b5aca1038a131" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "post"("createdAt", "updatedAt", "id", "urlTitle", "title", "content", "userId", "editable", "commentsEnabled", "visibility") SELECT "createdAt", "updatedAt", "id", "urlTitle", "title", "content", "userId", "editable", "commentsEnabled", "visibility" FROM "temporary_post"`);
        await queryRunner.query(`DROP TABLE "temporary_post"`);
        await queryRunner.query(`ALTER TABLE "post" RENAME TO "temporary_post"`);
        await queryRunner.query(`CREATE TABLE "post" ("createdAt" datetime NOT NULL DEFAULT (datetime('now')), "updatedAt" datetime NOT NULL DEFAULT (datetime('now')), "id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "urlTitle" varchar NOT NULL, "title" varchar NOT NULL, "content" varchar NOT NULL, "userId" integer, "editable" boolean NOT NULL DEFAULT (1), "commentsEnabled" boolean NOT NULL DEFAULT (1), "visibility" varchar NOT NULL, CONSTRAINT "FK_5c1cf55c308037b5aca1038a131" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "post"("createdAt", "updatedAt", "id", "urlTitle", "title", "content", "userId", "editable", "commentsEnabled", "visibility") SELECT "createdAt", "updatedAt", "id", "urlTitle", "title", "content", "userId", "editable", "commentsEnabled", "visibility" FROM "temporary_post"`);
        await queryRunner.query(`DROP TABLE "temporary_post"`);
    }

}
