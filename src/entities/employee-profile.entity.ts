import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('employee_profiles')
export class EmployeeProfile {
  @PrimaryColumn({ type: 'int' })
  user_id: number;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'text', nullable: true })
  skills?: string;

  @Column({ type: 'date' })
  date_of_birth: string;

  @Column({ type: 'varchar', length: 20 })
  gender: string;
}