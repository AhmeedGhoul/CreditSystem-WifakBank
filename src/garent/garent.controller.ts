import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post, Put, Query, Req,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request as ExpressRequest } from 'express';
import { Roles } from '../decorator/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../user/Roles.guard';
import { JwtUser } from '../user/strategy/jwt-user.interface';
import { GarentService } from './garent.service';
import { CreateGarentDto } from './dto/GarentDto.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('Client', 'Admin')
@Controller('garent')
export class GarentController {
  constructor(private garentService: GarentService) {}

  @Post('add')
  @HttpCode(HttpStatus.OK)
  addGarent(
    @Body() dto: CreateGarentDto,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as JwtUser;
    return this.garentService.createGarent(dto, user.userId);
  }
  @Get('search')
  getGarents(@Query() query: any, @Request() req: ExpressRequest) {
    const user = req.user as JwtUser;
    return this.garentService.searchGarents(query, user);
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  deleteGarent(
    @Param('id', ParseIntPipe) garentId: number,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as JwtUser;
    return this.garentService.deleteGarent(garentId, user);
  }

  @Put('modify/:id')
  @HttpCode(HttpStatus.OK)
  modifyGarent(
    @Param('id', ParseIntPipe) garentId: number,
    @Body() dto: CreateGarentDto,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as JwtUser;
    return this.garentService.editGarent(dto, garentId, user);
  }
  @Post('invite')
  @HttpCode(HttpStatus.OK)
  async inviteGarent(
    @Body('email') email: string,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as JwtUser;
    return this.garentService.inviteGarent(email, user.userId);
  }
  @Get('confirm')
  @HttpCode(HttpStatus.OK)
  async confirmGarent(@Query('token') token: string) {
    return this.garentService.confirmInvitation(token);
  }
  @Get('has-garent')
  async hasGarent(@Request() req: ExpressRequest): Promise<{ hasGarent: boolean }> {
    const user = req.user as JwtUser;

    const hasGarent = await this.garentService.checkIfUserHasGarent(user.userId);
    return { hasGarent };
  }
}
