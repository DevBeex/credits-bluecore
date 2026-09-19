import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CreditRequest } from '../credit-requests/credit-request.entity';

@Entity({ name: 'users', schema: 'esquema_b' })
export class User {
  @PrimaryColumn('uuid', { default: () => 'gen_random_uuid()' })
  id: string;

  @Column({ type: 'varchar', length: 254, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'text' })
  passwordHash: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @OneToMany(() => CreditRequest, (request) => request.createdBy)
  createdRequests: CreditRequest[];

  @OneToMany(() => CreditRequest, (request) => request.decidedBy)
  decidedRequests: CreditRequest[];
}