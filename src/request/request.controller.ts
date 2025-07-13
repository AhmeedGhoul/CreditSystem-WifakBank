import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus, NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post, Put, Query,
  Request,
  Res, UploadedFile,
  UseGuards, UseInterceptors,
} from '@nestjs/common';
import { Response, Request as ExpressRequest, Express } from 'express';
import { RequestService } from './request.service';
import { CreateRequestDto } from './dto/RequestDto.dto';
import { Roles } from '../decorator/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../user/Roles.guard';
import { JwtUser } from '../user/strategy/jwt-user.interface';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';


@Controller('request')
export class RequestController {
  constructor(private requestService: RequestService) {}

  @Post('add')
  @UseInterceptors(FileInterceptor('file'))
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Client', 'Admin')
  async addRequest(
    @Body('dto') dtoString: string,
    @Request() req: ExpressRequest,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const user = req.user as JwtUser;
    const dto: CreateRequestDto = JSON.parse(dtoString);
    return this.requestService.createRequest(dto, user.userId);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Agent','Auditor', 'Admin')
  @Get('search')
  getRequests(@Query() query: any, @Request() req: ExpressRequest) {
    const user = req.user as JwtUser;
    return this.requestService.searchRequests(query, user);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Agent','Auditor', 'Admin')
  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  deleteRequest(
    @Param('id', ParseIntPipe) requestId: number,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as JwtUser;
    return this.requestService.deleteRequest(requestId, user);
  }
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Agent','Auditor', 'Admin')
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
  @Get('documentPreview/:id')
  async previewDocument(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const doc = await this.requestService.getDocumentById(id);
    if (!doc || !doc.filePath) {
      throw new NotFoundException('Document not found');
    }
    return res.sendFile(doc.filePath, { root: './uploads' });
  }
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Agent', 'Admin')
  @Put('appByAgent/:id')
  @HttpCode(HttpStatus.OK)
  approveByAgent(
    @Param('id', ParseIntPipe) requestId: number,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as JwtUser;
    return this.requestService.editRequestByIdApprovedByAgent(requestId, user);
  }

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('Auditor', 'Admin')
  @Put('appByAuditor/:id')
  @HttpCode(HttpStatus.OK)
  approveByAuditor(
    @Param('id', ParseIntPipe) requestId: number,
    @Request() req: ExpressRequest
  ) {
    const user = req.user as JwtUser;
    return this.requestService.editRequestByIdApprovedByAuditor(requestId, user);
  }

}
