import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  UnauthorizedException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RefreshJwtAuthGuard } from './guards';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login-user')
  @HttpCode(HttpStatus.OK)
  async loginUser(@Body() body) {
    const account = await this.authService.validateUser(
      body.email,
      body.password,
    );
    if (!account) {
      return {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Invalid credentials',
      };
    }
    return this.authService.login(account);
  }

  @Post('login-admin')
  @HttpCode(HttpStatus.OK)
  async loginAdmin(@Body() body) {
    const account = await this.authService.validateAdmin(
      body.email,
      body.password,
    );
    if (!account) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.authService.login(account);
  }

  @Post('register')
  async register(@Body() body) {
    return this.authService.register(body.email, body.password);
  }

  @Post('refresh')
  @UseGuards(RefreshJwtAuthGuard)
  async refresh(@Request() req) {
    return this.authService.refreshAccessToken(req.user.refresh_token);
  }
}
