import { Injectable, CanActivate, ExecutionContext, HttpStatus, UnauthorizedException, Inject } from '@nestjs/common';
import { Console } from 'console';
import { Request } from 'express';
import { ValidateResponse } from './auth.pb';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  @Inject(AuthService)
  public readonly service: AuthService;

  public async canActivate(ctx: ExecutionContext): Promise<boolean> | never {
    const req: Request = ctx.switchToHttp().getRequest();
    const authorization: string = req.headers['authorization'];

    if (!authorization) {
      throw new UnauthorizedException();
    }

    console.error("Authorization", authorization)
    const bearer: string[] = authorization.split(' ');

    if (!bearer || bearer.length < 2) {
      console.error("Bearer", bearer)
      throw new UnauthorizedException();
    }

    const token: string = bearer[1];
    console.error("Token", token)

    const { status, userId }: ValidateResponse = await this.service.validate(token);
    console.error("Auth User" + req["user"])
    req["user"] = userId;

    if (status !== HttpStatus.OK) {
      throw new UnauthorizedException();
    }

    return true;
  }
}