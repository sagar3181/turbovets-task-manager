import { Body, Controller, Post } from '@nestjs/common';
import type { LoginDto, AuthToken } from '@turbovets-task-manager/data';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto): Promise<AuthToken> {
    const user = await this.auth.validateUser(dto.email, dto.password);
    return this.auth.issueToken(user);
  }
}
