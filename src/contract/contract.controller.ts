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
import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/ContractDto.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('Client', 'Admin')
@Controller('contract')
export class ContractController {
  constructor(private contractService: ContractService) {}

  @Post('add')
  @HttpCode(HttpStatus.OK)
  addContract(
    @Body() dto: CreateContractDto,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as JwtUser;
    return this.contractService.createContract(dto, user.userId);
  }

  @Get()
  async getContract(
    @Request() req: ExpressRequest,
    @Res() res: Response
  ) {
    const user = req.user as JwtUser;
    const data = await this.contractService.getContracts(user);
    return res.status(200).json({ status: 'success', data });
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  deleteContract(
    @Param('id', ParseIntPipe) ContractId: number,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as JwtUser;
    return this.contractService.deleteContract(ContractId, user);
  }

  @Put('modify/:id')
  @HttpCode(HttpStatus.OK)
  modifyContract(
    @Param('id', ParseIntPipe) ContractId: number,
    @Body() dto: CreateContractDto,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as JwtUser;
    return this.contractService.editContract(dto, ContractId, user);
  }
}
