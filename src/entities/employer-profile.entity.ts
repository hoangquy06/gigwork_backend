import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('employer_profiles')
export class EmployerProfile {
  @PrimaryColumn({ type: 'int' })
  user_id: number;

  @Column({ type: 'varchar', length: 200 })
  company_name: string;

  @Column({ type: 'varchar', length: 300 })
  company_address: string;
}