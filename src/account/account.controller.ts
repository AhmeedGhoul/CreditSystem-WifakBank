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
import { AccountService } from './account.service';
import { CreateAccountDto } from './dto/AccountDto.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('Client', 'Admin')
@Controller('account')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Post('add')
  @HttpCode(HttpStatus.OK)
  addAccount(
    @Body() dto: CreateAccountDto,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as JwtUser;
    return this.accountService.createAccount(dto, user.userId);
  }

  @Get()
  async getAccount(
    @Request() req: ExpressRequest,
    @Res() res: Response
  ) {
    const user = req.user as JwtUser;
    const data = await this.accountService.getAccounts(user);
    return res.status(200).json({ status: 'success', data });
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  deleteAccount(
    @Param('id', ParseIntPipe) accountId: number,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as JwtUser;
    return this.accountService.deleteAccount(accountId, user);
  }

  @Put('modify/:id')
  @HttpCode(HttpStatus.OK)
  modifyAccount(
    @Param('id', ParseIntPipe) accountId: number,
    @Body() dto: CreateAccountDto,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as JwtUser;
    return this.accountService.editAccount(dto, accountId, user);
  }
}
