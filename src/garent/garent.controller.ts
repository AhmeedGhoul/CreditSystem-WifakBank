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
  Post, Put,
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

  @Get()
  async getGarent(
    @Request() req: ExpressRequest,
    @Res() res: Response
  ) {
    const user = req.user as JwtUser;
    const data = await this.garentService.getGarents(user);
    return res.status(200).json({ status: 'success', data });
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
}
