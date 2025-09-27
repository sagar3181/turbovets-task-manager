import { Controller, Get, Post, Put, Delete, Param, Body, Req, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { CreateTaskDto, UpdateTaskDto } from '@turbovets-task-manager/data';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  listTasks(@Req() req: any) {
    return this.tasksService.list(req.user);
  }

  @Post()
  createTask(@Req() req: any, @Body() dto: CreateTaskDto) {
    return this.tasksService.create(req.user, dto);
  }

  @Put(':id')
  updateTask(@Req() req: any, @Param('id') id: number, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(req.user, id, dto);  // ✅ fixed
  }

  @Delete(':id')
  deleteTask(@Req() req: any, @Param('id') id: number) {
    return this.tasksService.delete(req.user, id);  // ✅ fixed
  }
}
