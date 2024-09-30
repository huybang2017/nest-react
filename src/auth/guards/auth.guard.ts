import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class LocalAuthGuard extends AuthGuard('local') {}
export const JwtAuthGuard = AuthGuard('jwt');
export const refreshJwtAuthGuard = AuthGuard('refresh-jwt');
