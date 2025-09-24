// Shared DTOs/interfaces for FE/BE

export type Role = 'owner' | 'admin' | 'viewer';

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthToken {
  access_token: string;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  category?: string;   // e.g., Work, Personal
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: 'open' | 'in_progress' | 'done';
  category?: string;
}

export interface TaskDto {
  id: number;
  title: string;
  description?: string;
  status: 'open' | 'in_progress' | 'done';
  category: string;
  organizationId: number;
  createdById: number;
}

export interface UserSummary {
  id: number;
  email: string;
  role: Role;
  organizationId: number;
}
