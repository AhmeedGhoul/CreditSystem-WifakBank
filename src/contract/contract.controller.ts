import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post, Put, Query,
  Request,
  Res,
  UploadedFile,
  UseGuards, UseInterceptors,
} from '@nestjs/common';
import { Response, Request as ExpressRequest } from 'express';
import { Roles } from '../decorator/roles.decorator';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../user/Roles.guard';
import { JwtUser } from '../user/strategy/jwt-user.interface';
import { ContractService } from './contract.service';
import { CreateContractDto } from './dto/ContractDto.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CreditPoolService } from './credit_pool/credit_pool.service';
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('Client', 'Admin')
@Controller('contract')
export class ContractController {
  constructor(private contractService: ContractService,private creditPoolService: CreditPoolService) {}


@Post('add')
@HttpCode(HttpStatus.CREATED)
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles('Client', 'Admin')
@UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({
    destination: './uploads/contracts',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now();
      const ext = extname(file.originalname) || '.pdf';
      const finalName = `contract_${uniqueSuffix}${ext}`;
      cb(null, finalName);
    },
  }),
}))
async addContract(
  @Body('dto') dtoString: string,
@UploadedFile() file: Express.Multer.File,
@Request() req: ExpressRequest
) {
  const user = req.user as JwtUser;
  const dto: CreateContractDto = JSON.parse(dtoString);

  if (!file) throw new BadRequestException('PDF contract file is required');

  const pdfUrl = `/uploads/contracts/${file.filename}`;

  const contract = await this.contractService.createContract(dto, user.userId, pdfUrl);

  await this.creditPoolService.isFullCreditPool(dto.creditPoolId);

  return contract;
}
  @Get('user/:id')
  getUserContracts(@Param('id') id: number) {
    return this.contractService.findByUserId(+id);
  }


  @Get('search')
  getContracts(@Query() query: any, @Request() req: ExpressRequest) {
    const user = req.user as JwtUser;
    return this.contractService.searchContracts(query, user);
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
  @Get('ranks/:creditPoolId')
  async getTakenRanks(@Param('creditPoolId') id: number) {
    return this.contractService.getTakenRanks(Number(id));
  }
}
