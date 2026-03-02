import { MigrationInterface, QueryRunner } from 'typeorm';

export class TrackingSettings1739400000000 implements MigrationInterface {
  name = 'TrackingSettings1739400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "tracking_settings" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "minimum_distance_meters" float NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_tracking_settings_id" PRIMARY KEY ("id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tracking_settings"`);
  }
}
