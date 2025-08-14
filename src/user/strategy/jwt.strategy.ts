import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.['access_token'],
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET_KEY!,
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, roles: payload.roles, email: payload.email };
  }

}
