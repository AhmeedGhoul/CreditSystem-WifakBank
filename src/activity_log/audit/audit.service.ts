import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuditDto } from './dto/AuditDto.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async createAudit(dto: CreateAuditDto) {
    const { activityLogIds, ...auditData } = dto;

    return this.prisma.audit.create({
      data: {
        ...auditData,
        activityLogs: {
          connect: activityLogIds?.map(id => ({ activityLogId: id })) || [],
        },
      },
    });
  }

  async editAudit(auditId: number, dto: CreateAuditDto) {
    const audit = await this.prisma.audit.findUnique({ where: { auditId } });
    if (!audit) throw new NotFoundException('Audit not found');

    const { activityLogIds, ...auditData } = dto;

    return this.prisma.audit.update({
      where: { auditId },
      data: {
        ...auditData,
        ...(activityLogIds && {
          activityLogs: {
            set: activityLogIds.map(id => ({ activityLogId: id })), // replace links
          },
        }),
      },
    });
  }

  async deleteAudit(auditId: number) {
    const audit = await this.prisma.audit.findUnique({ where: { auditId } });
    if (!audit) throw new NotFoundException('Audit not found');

    return this.prisma.audit.delete({ where: { auditId } });
  }

  async getAudits() {
    return this.prisma.audit.findMany({
      include: { activityLogs: true },
    });
  }

  async getAuditById(auditId: number) {
    const audit = await this.prisma.audit.findUnique({
      where: { auditId },
      include: { activityLogs: true },
    });
    if (!audit) throw new NotFoundException('Audit not found');
    return audit;
  }
}
