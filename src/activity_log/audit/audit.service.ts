import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAuditDto, ModifyAuditDto } from './dto/AuditDto.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { $Enums } from '../../../generated/prisma';
import AuditStatus = $Enums.AuditStatus;
import AuditType = $Enums.AuditType;
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

  async editAudit(auditId: number, dto: ModifyAuditDto) {
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

  // audit.service.ts
  async searchAudits(
    query: {
      startDate?: string;
      endDate?: string;
      statusAudit?: AuditStatus;
      output?: string;
      auditType?: AuditType;
      sortBy?: string | string[];
      page?: string;
      size?: string;
    }
  ) {
    const {
      startDate,
      endDate,
      statusAudit,
      output,
      auditType,
      sortBy,
      page = '1',
      size = '10',
    } = query;

    const pageNum = parseInt(page, 10);
    const sizeNum = parseInt(size, 10);
    const skip = (pageNum - 1) * sizeNum;

    const filters: any = {};

    if (statusAudit) filters.auditStatus = statusAudit;
    if (auditType) filters.auditType = auditType;
    if (output) filters.auditOutput = { contains: output, mode: 'insensitive' };

    if (startDate || endDate) {
      filters.auditDate = {};
      if (startDate) filters.auditDate.gte = new Date(startDate);
      if (endDate) filters.auditDate.lte = new Date(endDate);
    }

    // Handle sorting
    const sortArray =
      typeof sortBy === 'string'
        ? [sortBy]
        : Array.isArray(sortBy)
          ? sortBy
          : [];

    const orderBy = sortArray.map((field) => {
      const [key, direction = 'asc'] = field.split(':');
      return { [key]: direction.toLowerCase() === 'desc' ? 'desc' : 'asc' };
    });

    const [audits, total] = await Promise.all([
      this.prisma.audit.findMany({
        where: filters,
        skip,
        take: sizeNum,
        orderBy,
        include: { activityLogs: true },
      }),
      this.prisma.audit.count({ where: filters }),
    ]);

    return {
      data: audits,
      total,
      page: pageNum,
      size: sizeNum,
      totalPages: Math.ceil(total / sizeNum),
    };
  }

}
