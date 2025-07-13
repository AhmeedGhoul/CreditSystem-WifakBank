import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post, Query,
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
@Controller('activitylog')
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

  @Get('search')
  getLogs(@Query() query: any, @Request() req: ExpressRequest) {
    const user = req.user as JwtUser;
    return this.activityLogService.searchActivityLogs(query, user);
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
