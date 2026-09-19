import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUsersAndCreditRequests1789793928342 implements MigrationInterface {
    name = 'CreateUsersAndCreditRequests1789793928342'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "esquema_b"."credit_requests" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "applicant_document" character varying(30) NOT NULL, "amount" numeric(12,2) NOT NULL, "term_months" smallint NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'PENDING', "decision_comment" character varying(1000), "created_by" uuid NOT NULL, "decided_by" uuid, "decided_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "CHK_51854e171cba8ac1d70fb598fa" CHECK (
  (
    "status" = 'PENDING'
    AND "decision_comment" IS NULL
    AND "decided_by" IS NULL
    AND "decided_at" IS NULL
  )
  OR
  (
    "status" IN ('APPROVED', 'REJECTED')
    AND "decision_comment" IS NOT NULL
    AND length(btrim("decision_comment")) > 0
    AND "decided_by" IS NOT NULL
    AND "decided_at" IS NOT NULL
  )
), CONSTRAINT "CHK_f23fcbed5b761741666375c49e" CHECK ("status" IN ('PENDING', 'APPROVED', 'REJECTED')), CONSTRAINT "CHK_42f90e446f2ae160d8cdaa44ff" CHECK ("term_months" BETWEEN 6 AND 60), CONSTRAINT "CHK_77101c9dd36e6e80732063266e" CHECK ("amount" >= 500 AND "amount" <= 50000), CONSTRAINT "PK_0e6892aa27209fcd2fd6074018c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "idx_credit_requests_status" ON "esquema_b"."credit_requests" ("status") `);
        await queryRunner.query(`CREATE TABLE "esquema_b"."users" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "email" character varying(254) NOT NULL, "password_hash" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "esquema_b"."credit_requests" ADD CONSTRAINT "FK_d427331597aa9d59d06ddfb3993" FOREIGN KEY ("created_by") REFERENCES "esquema_b"."users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "esquema_b"."credit_requests" ADD CONSTRAINT "FK_a49e15f2790d16bfc4abc0080bb" FOREIGN KEY ("decided_by") REFERENCES "esquema_b"."users"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "esquema_b"."credit_requests" DROP CONSTRAINT "FK_a49e15f2790d16bfc4abc0080bb"`);
        await queryRunner.query(`ALTER TABLE "esquema_b"."credit_requests" DROP CONSTRAINT "FK_d427331597aa9d59d06ddfb3993"`);
        await queryRunner.query(`DROP TABLE "esquema_b"."users"`);
        await queryRunner.query(`DROP INDEX "esquema_b"."idx_credit_requests_status"`);
        await queryRunner.query(`DROP TABLE "esquema_b"."credit_requests"`);
    }

}
