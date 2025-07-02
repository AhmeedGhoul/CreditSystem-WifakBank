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
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request as ExpressRequest } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../user/Roles.guard';
import { Roles } from '../../decorator/roles.decorator';
import { JwtUser } from '../../user/strategy/jwt-user.interface';
import { CreditPoolService } from './credit_pool.service';
import { CreateCreditPoolDto } from './dto/CreditPool.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('Admin')
@Controller('creditpool')
export class CreditPoolController {
  constructor(private creditPoolService: CreditPoolService) {}

  @Post('add')
  @HttpCode(HttpStatus.OK)
  addCreditPool(@Body() dto: CreateCreditPoolDto) {
    return this.creditPoolService.createCreditPool(dto);
  }

  @Get()
  async getCreditPools(@Res() res: Response) {
    const data = await this.creditPoolService.getCreditPools();
    return res.status(200).json({ status: 'success', data });
  }

  @Get('contracts/:id')
  async getContractsByCreditPool(
    @Param('id', ParseIntPipe) creditPoolId: number,
    @Request() req: ExpressRequest,
    @Res() res: Response,
  ) {
    const user = req.user as JwtUser;
    const data = await this.creditPoolService.getContractsByCreditPool(creditPoolId, user);
    return res.status(200).json({ status: 'success', data });
  }

  @Patch('modify/:id')
  @HttpCode(HttpStatus.OK)
  modifyCreditPool(
    @Param('id', ParseIntPipe) creditPoolId: number,
    @Body() dto: CreateCreditPoolDto,
    @Request() req: ExpressRequest,
  ) {
    const user = req.user as JwtUser;
    return this.creditPoolService.editCreditPool(dto, creditPoolId, user);
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  deleteCreditPool(
    @Param('id', ParseIntPipe) creditPoolId: number,
    @Request() req: ExpressRequest,
  ) {
    const user = req.user as JwtUser;
    return this.creditPoolService.deleteCreditPool(creditPoolId, user);
  }
  @Patch('assign/:contractId/:creditPoolId')
  @HttpCode(HttpStatus.OK)
  assignContract(
    @Param('contractId', ParseIntPipe) contractId: number,
    @Param('creditPoolId', ParseIntPipe) creditPoolId: number,
    @Request() req: ExpressRequest,
  ) {
    const user = req.user as JwtUser;
    return this.creditPoolService.assignContractToCreditPool(contractId, creditPoolId, user);
  }

  @Patch('unassign/:contractId')
  @HttpCode(HttpStatus.OK)
  unassignContract(
    @Param('contractId', ParseIntPipe) contractId: number,
    @Request() req: ExpressRequest,
  ) {
    const user = req.user as JwtUser;
    return this.creditPoolService.removeContractFromCreditPool(contractId, user);
  }

}
