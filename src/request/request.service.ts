import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRequestDto } from './dto/RequestDto.dto';
import { JwtUser } from '../user/strategy/jwt-user.interface';
import { Express } from 'express';

@Injectable()
export class RequestService {
  constructor(private prisma: PrismaService) {}


  async createRequest(dto: CreateRequestDto, userId: number) {
    if (!dto) throw new BadRequestException('Request body is missing');

    const { documents, ...requestData } = dto;
    return this.prisma.request.create({
      data: {
        ...requestData,
        userUserId: userId,
        Documents: {
          create: documents?.map((doc) => ({
            documentDate: new Date(doc.documentDate),
            filePath: doc.filePath,
            originalName: doc.originalName,
            mimeType: doc.mimeType,
            size: doc.size,
          })) ?? [],
        },
      },
      include: {
        Documents: true,
      },
    });
  }






  async editRequest(dto: CreateRequestDto, requestId: number, user: JwtUser) {
    const request = await this.prisma.request.findUnique({ where: { requestId } });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (!user.roles.includes('Admin') && request.userUserId !== user.userId) {
      throw new ForbiddenException('You can only edit your own requests');
    }

    return this.prisma.request.update({
      where: { requestId },
      data: { ...dto },
    });
  }

  async deleteRequest(requestId: number, user: JwtUser) {
    const request = await this.prisma.request.findUnique({ where: { requestId } });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    if (!user.roles.includes('Admin') && request.userUserId !== user.userId) {
      throw new ForbiddenException('You can only delete your own requests');
    }

    return this.prisma.request.delete({ where: { requestId } });
  }

  async searchRequests(query: {
    isRequestApproved?: boolean;
    startDate?: string;
    endDate?: string;
    sortBy?: string | string[];
    page?: string;
    size?: string;
  }, user: JwtUser) {
    const { isRequestApproved, startDate, endDate, sortBy, page = '1', size = '10' } = query;
    const pageNum = parseInt(page, 10);
    const sizeNum = parseInt(size, 10);
    const skip = (pageNum - 1) * sizeNum;

    const filters: any = {};
    console.log(user.roles)
    if (!user.roles.includes('Admin')&& !user.roles.includes('Agent')&&!user.roles.includes('Auditor')) filters.userUserId = user.userId;
    if (isRequestApproved !== undefined) filters.isRequestApproved = isRequestApproved;
    if (startDate || endDate) {
      filters.requestDate = {};
      if (startDate) filters.requestDate.gte = new Date(startDate);
      if (endDate) filters.requestDate.lte = new Date(endDate);
    }

    const orderBy = (typeof sortBy === 'string' ? [sortBy] : sortBy || []).map(f => {
      const [key, dir = 'asc'] = f.split(':');
      return { [key]: dir.toLowerCase() === 'desc' ? 'desc' : 'asc' };
    });

    const [data, total] = await Promise.all([
      this.prisma.request.findMany({ where: filters, skip, take: sizeNum, orderBy ,include: {
          Documents: true,
    }, }),
      this.prisma.request.count({ where: filters }),
    ]);

    return { data, total, page: pageNum, size: sizeNum, totalPages: Math.ceil(total / sizeNum) };
  }
  async getDocumentById(id: number) {
    return this.prisma.document.findUnique({ where: { documentId: id } });
  }
  async editRequestByIdApprovedByAgent(requestId: number, user: JwtUser) {
    const request = await this.prisma.request.findUnique({ where: { requestId } });

    if (!request) {
      throw new NotFoundException('Request not found');
    }
    if (!user.roles.includes('Agent') && request.userUserId !== user.userId) {
      throw new ForbiddenException('You can only Approved by Agent');
    }
    return this.prisma.request.update({
      where: { requestId },
      data: { isRequestApprovedByAgent:true },
    });
  }
  async editRequestByIdApprovedByAuditor(requestId: number, user: JwtUser) {
    const request = await this.prisma.request.findUnique({ where: { requestId } });

    if (!request) {
      throw new NotFoundException('Request not found');
    }
    if (!user.roles.includes('Auditor') && request.userUserId !== user.userId) {
      throw new ForbiddenException('You can only Approved by Auditor');
    }
    return this.prisma.request.update({
      where: { requestId },
      data: { isRequestApprovedByAuditor:true },
    });
  }
  async findRequestByUserId(userId: number){
   return this.prisma.request.findFirst({where:{
       userUserId:userId
     }})
  }
}
