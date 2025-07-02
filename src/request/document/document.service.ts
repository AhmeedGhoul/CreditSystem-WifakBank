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

  async createDocument(dto: CreateDocumentDto, requestId: number, user: JwtUser) {
    const request = await this.prisma.request.findUnique({
      where: { requestId },
    });

    if (!request) throw new NotFoundException('Request not found');

    if (!user.roles.includes('Admin') && request.userUserId !== user.userId) {
      throw new ForbiddenException('You cannot add documents to a request that is not yours');
    }

    return this.prisma.document.create({
      data: {
        ...dto,
        requestId: requestId,
      },
    });
  }

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

  async getDocumentsByRequest(requestId: number, user: JwtUser) {
    const request = await this.prisma.request.findUnique({
      where: { requestId },
    });

    if (!request) throw new NotFoundException('Request not found');

    if (!user.roles.includes('Admin') && request.userUserId !== user.userId) {
      throw new ForbiddenException('You can only view documents linked to your own request');
    }

    return this.prisma.document.findMany({
      where: { requestId },
    });
  }
}
