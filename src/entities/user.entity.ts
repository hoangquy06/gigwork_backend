import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  user_id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  email: string;

  @Column({ type: 'text' })
  password_hash: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  full_name?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'boolean', default: false })
  role_worker: boolean;

  @Column({ type: 'boolean', default: false })
  role_employer: boolean;

  @Column({ type: 'varchar', length: 20, default: 'active' })
  status: string;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  last_login_at?: Date;
}
