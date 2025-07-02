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
  Put,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request as ExpressRequest } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuditService } from './audit.service';
import { CreateAuditDto } from './dto/AuditDto.dto';
import { RolesGuard } from '../../user/Roles.guard';
import { Roles } from '../../decorator/roles.decorator';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('Client', 'Admin')
@Controller('audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post('add')
  @HttpCode(HttpStatus.OK)
  addAudit(@Body() dto: CreateAuditDto) {
    return this.auditService.createAudit(dto);
  }

  @Get()
  async getAudits(@Res() res: Response) {
    const data = await this.auditService.getAudits();
    return res.status(200).json({ status: 'success', data });
  }

  @Get(':id')
  async getAuditById(
    @Param('id', ParseIntPipe) auditId: number,
    @Res() res: Response
  ) {
    const data = await this.auditService.getAuditById(auditId);
    return res.status(200).json({ status: 'success', data });
  }

  @Put('modify/:id')
  @HttpCode(HttpStatus.OK)
  modifyAudit(
    @Param('id', ParseIntPipe) auditId: number,
    @Body() dto: CreateAuditDto
  ) {
    return this.auditService.editAudit(auditId, dto);
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  deleteAudit(@Param('id', ParseIntPipe) auditId: number) {
    return this.auditService.deleteAudit(auditId);
  }
}
