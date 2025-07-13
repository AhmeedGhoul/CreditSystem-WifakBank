import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocumentDto } from './dto/DocumentDto.dto';
import { JwtUser } from '../../user/strategy/jwt-user.interface';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) {}



  async editDocument(dto: CreateDocumentDto, documentId: number, user: JwtUser) {
    const document = await this.prisma.document.findUnique({
      where: { documentId },
      include: { Request: true },
    });

    if (!document) throw new NotFoundException('Document not found');

    if (!user.roles.includes('Admin') && document.Request?.userUserId !== user.userId) {
      throw new ForbiddenException('You can only edit documents linked to your own request');
    }

    return this.prisma.document.update({
      where: { documentId },
      data: { ...dto },
    });
  }

  async deleteDocument(documentId: number, user: JwtUser) {
    const document = await this.prisma.document.findUnique({
      where: { documentId },
      include: { Request: true },
    });

    if (!document) throw new NotFoundException('Document not found');

    if (!user.roles.includes('Admin') && document.Request?.userUserId !== user.userId) {
      throw new ForbiddenException('You can only delete documents linked to your own request');
    }

    return this.prisma.document.delete({ where: { documentId } });
  }

  async searchDocuments(query: {
    requestId: number;
    isApproved?: boolean;
    startDate?: string;
    endDate?: string;
    sortBy?: string | string[];
    page?: string;
    size?: string;
  }, user: JwtUser) {
    const { requestId, isApproved, startDate, endDate, sortBy, page = '1', size = '10' } = query;
    const request = await this.prisma.request.findUnique({ where: { requestId } });
    if (!request) throw new NotFoundException('Request not found');
    if (!user.roles.includes('Admin') && request.userUserId !== user.userId)
      throw new ForbiddenException('Access denied');

    const pageNum = parseInt(page, 10);
    const sizeNum = parseInt(size, 10);
    const skip = (pageNum - 1) * sizeNum;

    const filters: any = { requestId };
    if (isApproved !== undefined) filters.isApproved = isApproved;
    if (startDate || endDate) {
      filters.documentDate = {};
      if (startDate) filters.documentDate.gte = new Date(startDate);
      if (endDate) filters.documentDate.lte = new Date(endDate);
    }

    const orderBy = (typeof sortBy === 'string' ? [sortBy] : sortBy || []).map(f => {
      const [key, dir = 'asc'] = f.split(':');
      return { [key]: dir.toLowerCase() === 'desc' ? 'desc' : 'asc' };
    });

    const [data, total] = await Promise.all([
      this.prisma.document.findMany({ where: filters, skip, take: sizeNum, orderBy }),
      this.prisma.document.count({ where: filters }),
    ]);

    return { data, total, page: pageNum, size: sizeNum, totalPages: Math.ceil(total / sizeNum) };
  }

}
