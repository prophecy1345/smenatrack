import { MigrationInterface, QueryRunner } from 'typeorm';

export class UniqueHabitLogPerDay1784369037903 implements MigrationInterface {
  name = 'UniqueHabitLogPerDay1784369037903';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "habit_logs" ADD CONSTRAINT "UQ_0cc1b37af1973391d8bc2566df0" UNIQUE ("habit_id", "date")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "habit_logs" DROP CONSTRAINT "UQ_0cc1b37af1973391d8bc2566df0"`,
    );
  }
}
