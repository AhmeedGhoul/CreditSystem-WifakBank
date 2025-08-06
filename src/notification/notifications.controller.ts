import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post, Put, Query,
  Request,
  Res,
  UploadedFile,
  UseGuards, UseInterceptors,
} from '@nestjs/common';
import { Response, Request as ExpressRequest } from 'express';
import { Roles } from '../decorator/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../user/Roles.guard';
import { JwtUser } from '../user/strategy/jwt-user.interface';
import { NotificationService } from './notification.service';
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('Client', 'Admin')
@Controller('notification')
export class NotificationsController {

  constructor(private notificationService: NotificationService) {
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Client','Agent', 'Admin')
  async getMyNotifications(@Request() req: ExpressRequest) {
    const user = req.user as JwtUser;
    return this.notificationService.getNotification(user);
  }
}
