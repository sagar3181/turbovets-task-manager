import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Organization) private readonly orgs: Repository<Organization>,
  ) {}

  async seed() {
    const count = await this.users.count();
    if (count > 0) return;

    // --- Create organizations ---
    const hq = await this.orgs.save(this.orgs.create({ name: 'TurboVets HQ' }));
    const clinic = await this.orgs.save(this.orgs.create({ name: 'Clinic A', parent: hq }));

    // --- Helper for password hashing ---
    const hash = async (p: string) => await bcrypt.hash(p, 10);

    // --- Create users ---
    const users = [
      this.users.create({
        email: 'owner@tv.com',
        password: await hash('owner123'),
        role: 'owner' as any,
        organization: hq,
      }),
      this.users.create({
        email: 'admin@tv.com',
        password: await hash('admin123'),
        role: 'admin' as any,
        organization: clinic,
      }),
      this.users.create({
        email: 'viewer@tv.com',
        password: await hash('viewer123'),
        role: 'viewer' as any,
        organization: clinic,
      }),
    ];

    await this.users.save(users);

    // eslint-disable-next-line no-console
    console.log('[seed] Users ready: owner@tv.com/owner123, admin@tv.com/admin123, viewer@tv.com/viewer123');
  }
}
