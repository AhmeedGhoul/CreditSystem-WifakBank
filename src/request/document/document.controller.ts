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

  @Post('add/:requestId')
  @HttpCode(HttpStatus.OK)
  addDocument(
    @Param('requestId', ParseIntPipe) requestId: number,
    @Body() dto: CreateDocumentDto,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as JwtUser;
    return this.documentService.createDocument(dto, requestId, user);
  }

  @Get('by-request/:requestId')
  async getDocuments(
    @Param('requestId', ParseIntPipe) requestId: number,
    @Request() req: ExpressRequest,
    @Res() res: Response
  ) {
    const user = req.user as JwtUser;
    const data = await this.documentService.getDocumentsByRequest(requestId, user);
    return res.status(200).json({ status: 'success', data });
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
