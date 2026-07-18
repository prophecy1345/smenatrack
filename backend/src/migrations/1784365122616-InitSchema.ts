import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1784365122616 implements MigrationInterface {
  name = 'InitSchema1784365122616';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "password_hash" character varying NOT NULL, "shift_pattern" character varying NOT NULL, "role" character varying NOT NULL DEFAULT 'user', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "habits" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "frequency" character varying NOT NULL DEFAULT 'daily', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "owner_id" uuid, CONSTRAINT "PK_b3ec33c2d7af69d09fcf4af7e39" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "habit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "date" date NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "habit_id" uuid, CONSTRAINT "PK_683b23b199ac5c9c1f06e0e7c9e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "habits" ADD CONSTRAINT "FK_eeb3a9441cc837e8ffe40b46135" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "habit_logs" ADD CONSTRAINT "FK_f3f2d75f039fcdf30df838abdf2" FOREIGN KEY ("habit_id") REFERENCES "habits"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "habit_logs" DROP CONSTRAINT "FK_f3f2d75f039fcdf30df838abdf2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "habits" DROP CONSTRAINT "FK_eeb3a9441cc837e8ffe40b46135"`,
    );
    await queryRunner.query(`DROP TABLE "habit_logs"`);
    await queryRunner.query(`DROP TABLE "habits"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
