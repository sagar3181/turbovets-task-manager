import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../entities/task.entity';
import type { CreateTaskDto, UpdateTaskDto } from '@turbovets-task-manager/data';

type Role = 'owner' | 'admin' | 'viewer';
type UserCtx = { id: number; role: Role; organizationId: number };

@Injectable()
export class TasksService {
  constructor(@InjectRepository(Task) private readonly tasks: Repository<Task>) {}

  /** simple helper to keep audit logs consistent */
  private audit(action: string, user: UserCtx, task: Task) {
    // eslint-disable-next-line no-console
    console.log(
      `[audit] ${action} by user=${user.id} (role=${user.role}, org=${user.organizationId}) on task=${task.id}`
    );
  }

  async list(user: UserCtx) {
    if (user.role === 'owner') {
      return this.tasks.find({ relations: ['organization', 'createdBy'] });
    }
    if (user.role === 'admin') {
      return this.tasks.find({
        where: { organization: { id: user.organizationId } },
        relations: ['organization', 'createdBy'],
      });
    }
    // viewer — only own tasks
    return this.tasks.find({
      where: { createdBy: { id: user.id } },
      relations: ['organization', 'createdBy'],
    });
  }

  async create(user: UserCtx, dto: CreateTaskDto) {
    if (user.role === 'viewer') throw new ForbiddenException('Insufficient role');

    const t = this.tasks.create({
      title: dto.title,
      description: dto.description,
      category: dto.category ?? 'General',
      status: 'open',
      createdBy: { id: user.id } as any,
      organization: { id: user.organizationId } as any,
    });

    const saved = await this.tasks.save(t);
    this.audit('CREATE', user, saved);
    return saved;
  }

  async update(user: UserCtx, id: number, dto: UpdateTaskDto) {
    const task = await this.tasks.findOne({
      where: { id },
      relations: ['organization', 'createdBy'],
    });
    if (!task) throw new NotFoundException('Task not found');

    const sameOrg = task.organization?.id === user.organizationId;
    const isOwner = user.role === 'owner';
    const isAdminSameOrg = user.role === 'admin' && sameOrg;
    const isViewerOwn = user.role === 'viewer' && task.createdBy?.id === user.id;

    if (!(isOwner || isAdminSameOrg || isViewerOwn)) {
      throw new ForbiddenException('No permission to update');
    }

    Object.assign(task, dto);
    const updated = await this.tasks.save(task);
    this.audit('UPDATE', user, updated);
    return updated;
  }

  async remove(user: UserCtx, id: number) {
    const task = await this.tasks.findOne({
      where: { id },
      relations: ['organization', 'createdBy'],
    });
    if (!task) throw new NotFoundException('Task not found');

    const sameOrg = task.organization?.id === user.organizationId;
    const canDelete = user.role === 'owner' || (user.role === 'admin' && sameOrg);
    if (!canDelete) throw new ForbiddenException('No permission to delete');

    await this.tasks.remove(task);
    this.audit('DELETE', user, task);
    return { deleted: true };
  }
}
