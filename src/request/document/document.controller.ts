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
  Post, Query,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response, Request as ExpressRequest } from 'express';
import { DocumentService } from './document.service';
import { CreateDocumentDto } from './dto/DocumentDto.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../../user/Roles.guard';
import { Roles } from '../../decorator/roles.decorator';
import { JwtUser } from '../../user/strategy/jwt-user.interface';

@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('Client', 'Admin')
@Controller('document')
export class DocumentController {
  constructor(private documentService: DocumentService) {}



  @Get('documents/search')
  getDocuments(@Query() query: any, @Request() req: ExpressRequest) {
    const user = req.user as JwtUser;
    return this.documentService.searchDocuments(query, user);
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  deleteDocument(
    @Param('id', ParseIntPipe) documentId: number,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as JwtUser;
    return this.documentService.deleteDocument(documentId, user);
  }

  @Patch('modify/:id')
  @HttpCode(HttpStatus.OK)
  modifyDocument(
    @Param('id', ParseIntPipe) documentId: number,
    @Body() dto: CreateDocumentDto,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as JwtUser;
    return this.documentService.editDocument(dto, documentId, user);
  }
}
