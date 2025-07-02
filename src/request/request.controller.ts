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
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/RequestDto.dto';
import { Roles } from '../decorator/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../user/Roles.guard';
import { JwtUser } from '../user/strategy/jwt-user.interface';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('Client', 'Admin')
@Controller('request')
export class RequestController {
  constructor(private requestService: RequestService) {}

  @Post('add')
  @HttpCode(HttpStatus.OK)
  addRequest(
    @Body() dto: CreateRequestDto,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as JwtUser;
    return this.requestService.createRequest(dto, user.userId);
  }

  @Get()
  async getRequest(
    @Request() req: ExpressRequest,
    @Res() res: Response
  ) {
    const user = req.user as JwtUser;
    const data = await this.requestService.getRequests(user);
    return res.status(200).json({ status: 'success', data });
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  deleteRequest(
    @Param('id', ParseIntPipe) requestId: number,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as JwtUser;
    return this.requestService.deleteRequest(requestId, user);
  }

  @Put('modify/:id')
  @HttpCode(HttpStatus.OK)
  modifyRequest(
    @Param('id', ParseIntPipe) requestId: number,
    @Body() dto: CreateRequestDto,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as JwtUser;
    return this.requestService.editRequest(dto, requestId, user);
  }
}
