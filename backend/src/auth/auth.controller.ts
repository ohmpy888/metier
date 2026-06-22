import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

interface LoginDto {
  username?: string;
  password?: string;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.username || '', body.password || '');
  }
}
