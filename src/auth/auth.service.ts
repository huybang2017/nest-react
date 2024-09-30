import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, password: string) {
    console.log(email, password);
    try {
      const user = await this.validateUser(email, password);
      if (!user) {
        throw new HttpException(
          {
            status: HttpStatus.UNAUTHORIZED,
            message: 'Invalid credentials',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const payload = { email: user.email, sub: user.id };
      const accessToken = this.jwtService.sign(payload);
      const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

      return {
        status: HttpStatus.OK,
        message: 'Login successful',
        data: {
          access_token: accessToken,
          refreshToken: refreshToken,
          user: {
            id: user.id,
            email: user.email,
          },
        },
      };
    } catch (error) {
      throw new HttpException(
        {
          status: error.status,
          message: error.message || 'An error occurred during login',
        },
        error.status,
      );
    }
  }

  async refreshToken(user: User) {
    const payload = {
      username: user.email,
      sub: {
        name: user.name,
      },
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }

  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(email);
    if (user && user.password === pass) {
      const { ...result } = user;
      return result;
    }
    return null;
  }
}
