import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../user/Roles.guard';
import { Roles } from '../decorator/roles.decorator';
import { Request as ExpressRequest, Response } from 'express';
import { JwtUser } from '../user/strategy/jwt-user.interface';
import { ActivityLogService } from './activity_log.service';
import { CreateActivityLogDto } from './dto/ActivityLogDto.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('Admin', 'Client')
@Controller('activity-log')
export class ActivityLogController {
  constructor(private activityLogService: ActivityLogService) {}

  @Post('add')
  @HttpCode(HttpStatus.OK)
  async addActivity(
    @Body() dto: CreateActivityLogDto,
    @Request() req: ExpressRequest,
  ) {
    const user = req.user as JwtUser;
    return this.activityLogService.create(dto, user.userId);
  }

  @Get()
  async getAllActivities(
    @Request() req: ExpressRequest,
    @Res() res: Response,
  ) {
    const user = req.user as JwtUser;
    const data = await this.activityLogService.findAll(user);
    return res.status(200).json({ status: 'success', data });
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  async deleteActivity(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: ExpressRequest,
  ) {
    const user = req.user as JwtUser;
    return this.activityLogService.delete(id, user);
  }
}
