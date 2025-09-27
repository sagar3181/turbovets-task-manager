import { Controller, Get, Post, Put, Param, Body, Req, UseGuards } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';  // ✅ make sure this exists
import type { CreateTaskDto, UpdateTaskDto } from '@turbovets-task-manager/data';

@Controller('tasks')
@UseGuards(JwtAuthGuard)   // 🔒 protect all routes with JWT
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  listTasks(@Req() req: any) {
    return this.tasksService.list(req.user);   // ✅ req.user comes from JWT
  }

  @Post()
  createTask(@Req() req: any, @Body() dto: CreateTaskDto) {
  console.log("🔍 User from JWT:", req.user);  // 👀 add this
  return this.tasksService.create(req.user, dto);
  }

  @Put(':id')
  updateTask(@Req() req: any, @Param('id') id: number, @Body() dto: UpdateTaskDto) {
    return this.tasksService.update(req.user, id, dto);
  }
}
