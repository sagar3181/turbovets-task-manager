import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles, RolesGuard, GetUser } from '@turbovets-task-manager/auth';
import type { CreateTaskDto, UpdateTaskDto } from '@turbovets-task-manager/data';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasks: TasksService) {}

  @Get()
  async list(@GetUser() user: any) {
    console.log(`[AUDIT] list tasks by ${user.email} (${user.role})`);
    return this.tasks.list(user);
  }

  @Post()
  @Roles('admin', 'owner')
  async create(@GetUser() user: any, @Body() dto: CreateTaskDto) {
    console.log(`[AUDIT] create task by ${user.email}`);
    return this.tasks.create(user, dto);
  }

  @Patch(':id')
  async update(@GetUser() user: any, @Param('id') id: string, @Body() dto: UpdateTaskDto) {
    console.log(`[AUDIT] update task ${id} by ${user.email}`);
    return this.tasks.update(user, Number(id), dto);
  }

  @Delete(':id')
  @Roles('admin', 'owner')
  async remove(@GetUser() user: any, @Param('id') id: string) {
    console.log(`[AUDIT] delete task ${id} by ${user.email}`);
    return this.tasks.remove(user, Number(id));
  }
}
