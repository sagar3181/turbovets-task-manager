import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Organization } from './organization.entity';
import { Task } from './task.entity';

export type Role = 'owner' | 'admin' | 'viewer';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: 'varchar' })
  role!: Role;

  @ManyToOne(() => Organization, (org) => org.users, { nullable: false })
  organization!: Organization;

  @OneToMany(() => Task, (t) => t.createdBy)
  tasks!: Task[];
}
