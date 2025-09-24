import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import type { Role } from '@turbovets-task-manager/data';

const roleRank: Record<Role, number> = {
  owner: 3,
  admin: 2,
  viewer: 1,
};

interface UserPayload {
  id: number;
  role: Role;
  organizationId: number;
}

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = ctx.switchToHttp().getRequest();
    const user: UserPayload | undefined = request.user;

    if (!user) {
      return false; // No user, no access
    }

    return requiredRoles.some((role) => roleRank[user.role] >= roleRank[role]);
  }
}
