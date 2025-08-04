import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Access Denied. No token found.');
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      request['user'] = decoded;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid token.');
    }
  }
}
