import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddShiftSchedule1784369600000 implements MigrationInterface {
  name = 'AddShiftSchedule1784369600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD "shift_start_date" date`);
    await queryRunner.query(
      `ALTER TABLE "users" ADD "time_zone" character varying`,
    );
    // Для существующих пользователей настоящей даты начала цикла взять неоткуда:
    // ставим сегодняшнюю как заглушку, поправить её можно через PATCH /auth/me.
    await queryRunner.query(
      `UPDATE "users" SET "shift_start_date" = CURRENT_DATE, "time_zone" = 'UTC'`,
    );
    await queryRunner.query(
      `UPDATE "users" SET "shift_pattern" = '1/3' WHERE "shift_pattern" = 'сутки/трое'`,
    );
    // До этой миграции DTO принимал любую строку. Неподдерживаемые legacy-значения
    // нужно нормализовать до добавления CHECK, иначе обновление схемы прервётся.
    await queryRunner.query(
      `UPDATE "users" SET "shift_pattern" = '2/2' WHERE "shift_pattern" NOT IN ('2/2', '3/3', '1/3')`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "shift_start_date" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "time_zone" SET NOT NULL`,
    );
    // Список продублирован из SHIFT_PATTERNS намеренно: миграция — снимок схемы на момент
    // выпуска, импорт константы задним числом менял бы смысл уже применённой миграции.
    // Новый график = новая миграция, меняющая этот CHECK.
    await queryRunner.query(
      `ALTER TABLE "users" ADD CONSTRAINT "CHK_users_shift_pattern" CHECK ("shift_pattern" IN ('2/2', '3/3', '1/3'))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP CONSTRAINT "CHK_users_shift_pattern"`,
    );
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "time_zone"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "shift_start_date"`,
    );
  }
}
