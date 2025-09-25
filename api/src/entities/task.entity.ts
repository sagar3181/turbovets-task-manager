import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';

@Entity()
export class Task {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ default: 'open' })
  status: 'open' | 'in_progress' | 'done';

  @Column({ default: 'General' })
  category: string;

  @ManyToOne(() => Organization, (org) => org.tasks)
  organization: Organization;

  @ManyToOne(() => User, (u) => u.id)
  createdBy: User;
}
