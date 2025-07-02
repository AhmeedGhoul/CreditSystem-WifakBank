// fraud_case.controller.ts
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
  Put,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { FraudCaseService } from './fraud_case.service';
import { RolesGuard } from '../../user/Roles.guard';
import { Roles } from '../../decorator/roles.decorator';
import { CreateFraudCaseDto } from './dto/Fraud_CaseDto.dto';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('Admin')
@Controller('fraudcase')
export class FraudCaseController {
  constructor(private fraudCaseService: FraudCaseService) {}

  @Post('add/:auditId')
  @HttpCode(HttpStatus.OK)
  addFraudCase(
    @Param('auditId', ParseIntPipe) auditId: number,
    @Body() dto: CreateFraudCaseDto
  ) {
    return this.fraudCaseService.createFraudCase(dto, auditId);
  }

  @Get()
  async getAll(@Res() res: Response) {
    const data = await this.fraudCaseService.getFraudCases();
    return res.status(200).json({ status: 'success', data });
  }

  @Get(':id')
  async getOne(
    @Param('id', ParseIntPipe) fraudCaseId: number,
    @Res() res: Response
  ) {
    const data = await this.fraudCaseService.getFraudCaseById(fraudCaseId);
    return res.status(200).json({ status: 'success', data });
  }

  @Put('modify/:id')
  @HttpCode(HttpStatus.OK)
  updateFraudCase(
    @Param('id', ParseIntPipe) fraudCaseId: number,
    @Body() dto: CreateFraudCaseDto
  ) {
    return this.fraudCaseService.editFraudCase(fraudCaseId, dto);
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  deleteFraudCase(@Param('id', ParseIntPipe) fraudCaseId: number) {
    return this.fraudCaseService.deleteFraudCase(fraudCaseId);
  }
}
