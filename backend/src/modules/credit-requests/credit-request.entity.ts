import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { CreditRequestStatus } from './credit-request-status.enum';

@Entity({ name: 'credit_requests', schema: 'esquema_b' })
@Check(`"amount" >= 500 AND "amount" <= 50000`)
@Check(`"term_months" BETWEEN 6 AND 60`)
@Check(`"status" IN ('PENDING', 'APPROVED', 'REJECTED')`)
@Check(`
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
`)
export class CreditRequest {
  @PrimaryColumn('uuid', { default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ name: 'applicant_document', type: 'varchar', length: 30 })
  applicantDocument: string;

  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount: string;

  @Column({ name: 'term_months', type: 'smallint' })
  termMonths: number;

  @Index('idx_credit_requests_status')
  @Column({
    type: 'varchar',
    length: 20,
    default: CreditRequestStatus.PENDING,
  })
  status: CreditRequestStatus;

  @Column({
    name: 'decision_comment',
    type: 'varchar',
    length: 1000,
    nullable: true,
  })
  decisionComment: string | null;

  @ManyToOne(() => User, (user) => user.createdRequests, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @Column({ name: 'created_by', type: 'uuid' })
  createdById: string;

  @ManyToOne(() => User, (user) => user.decidedRequests, {
    nullable: true,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'decided_by' })
  decidedBy: User | null;

  @Column({ name: 'decided_by', type: 'uuid', nullable: true })
  decidedById: string | null;

  @Column({ name: 'decided_at', type: 'timestamptz', nullable: true })
  decidedAt: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;
}