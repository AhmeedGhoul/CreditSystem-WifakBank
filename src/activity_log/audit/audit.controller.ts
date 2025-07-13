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
  Put, Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request as ExpressRequest } from 'express';
import { AuthGuard } from '@nestjs/passport';
import { AuditService } from './audit.service';
import { CreateAuditDto, ModifyAuditDto } from './dto/AuditDto.dto';
import { RolesGuard } from '../../user/Roles.guard';
import { Roles } from '../../decorator/roles.decorator';


@Controller('Audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}
  @Post('add')
  @HttpCode(HttpStatus.OK)
  addAudit(@Body() dto: CreateAuditDto) {
    return this.auditService.createAudit(dto);
  }
    @Get('search')
    @HttpCode(HttpStatus.OK)
    getAuditsWithFilter(@Query() query: any) {
      return this.auditService.searchAudits(query);
    }

  @Patch('modify/:id')
  @HttpCode(HttpStatus.OK)
  modifyAudit(
    @Param('id', ParseIntPipe) auditId: number,
    @Body() dto: ModifyAuditDto
  ) {
    return this.auditService.editAudit(auditId, dto);
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  deleteAudit(@Param('id', ParseIntPipe) auditId: number) {
    return this.auditService.deleteAudit(auditId);
  }
}
