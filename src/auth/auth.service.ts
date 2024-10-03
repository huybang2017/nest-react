import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Account } from 'src/account/account.entity';
import { messageResponse } from 'src/common/utils/message';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string): Promise<Account | null> {
    const account = await this.accountRepository.findOne({ where: { email } });
    if (
      account &&
      pass === account.password &&
      account.active &&
      account.role === 'user'
    ) {
      return account;
    }
    return null;
  }

  async validateAdmin(email: string, pass: string): Promise<Account | null> {
    const account = await this.accountRepository.findOne({ where: { email } });
    if (
      account &&
      pass === account.password &&
      account.active &&
      account.role === 'admin'
    ) {
      return account;
    }
    return null;
  }

  async login(account: Account) {
    const payload = { email: account.email, sub: account.id };
    return {
      statusCode: HttpStatus.OK,
      message: messageResponse.LOGIN,
      data: {
        id: account.id,
        email: account.email,
        role: account.role,
        access_token: this.jwtService.sign(payload),
        refresh_token: this.generateRefreshToken(payload),
      },
    };
  }

  async register(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newAccount = this.accountRepository.create({
      email,
      password: hashedPassword,
    });
    return this.accountRepository.save(newAccount);
  }

  private generateRefreshToken(payload: any) {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: process.env.JWT_REFRESH_EXPIRATION,
    });
  }

  async refreshAccessToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const newAccessToken = this.jwtService.sign({
        email: payload.email,
        sub: payload.sub,
      });
      return { access_token: newAccessToken };
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
