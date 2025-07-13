// fraud_case.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFraudCaseDto } from './dto/Fraud_CaseDto.dto';
import { $Enums } from '../../../generated/prisma';
import FraudCaseType = $Enums.FraudCaseType;
import CaseStatus = $Enums.CaseStatus;
@Injectable()
export class FraudCaseService {
  constructor(private prisma: PrismaService) {}

  async createFraudCase(dto: CreateFraudCaseDto, auditId: number) {
    const audit = await this.prisma.audit.findUnique({ where: { auditId } });
    if (!audit) throw new NotFoundException('Audit not found');

    return this.prisma.fraud_Case.create({
      data: {
        ...dto,
        audit: { connect: { auditId } },
      },
    });
  }

  async editFraudCase(fraudCaseId: number, dto: CreateFraudCaseDto) {
    const existing = await this.prisma.fraud_Case.findUnique({ where: { fraudCaseId } });
    if (!existing) throw new NotFoundException('Fraud case not found');

    return this.prisma.fraud_Case.update({
      where: { fraudCaseId },
      data: { ...dto },
    });
  }

  async deleteFraudCase(fraudCaseId: number) {
    const existing = await this.prisma.fraud_Case.findUnique({ where: { fraudCaseId } });
    if (!existing) throw new NotFoundException('Fraud case not found');

    return this.prisma.fraud_Case.delete({ where: { fraudCaseId } });
  }

  async searchFraudCases(query: {
    fraudCaseType?: FraudCaseType;
    caseStatus?: CaseStatus;
    startDate?: string;
    endDate?: string;
    sortBy?: string | string[];
    page?: string;
    size?: string;
  }) {
    const { fraudCaseType, caseStatus, startDate, endDate, sortBy, page = '1', size = '10' } = query;
    const pageNum = parseInt(page, 10);
    const sizeNum = parseInt(size, 10);
    const skip = (pageNum - 1) * sizeNum;

    const filters: any = {};
    if (fraudCaseType) filters.fraudCaseType = fraudCaseType;
    if (caseStatus) filters.caseStatus = caseStatus;
    if (startDate || endDate) {
      filters.detectionDate = {};
      if (startDate) filters.detectionDate.gte = new Date(startDate);
      if (endDate) filters.detectionDate.lte = new Date(endDate);
    }

    const orderBy = (typeof sortBy === 'string' ? [sortBy] : sortBy || []).map(field => {
      const [key, dir = 'asc'] = field.split(':');
      return { [key]: dir.toLowerCase() === 'desc' ? 'desc' : 'asc' };
    });

    const [data, total] = await Promise.all([
      this.prisma.fraud_Case.findMany({ where: filters, skip, take: sizeNum, orderBy, include: { audit: true } }),
      this.prisma.fraud_Case.count({ where: filters }),
    ]);

    return {
      data,
      total,
      page: pageNum,
      size: sizeNum,
      totalPages: Math.ceil(total / sizeNum),
    };
  }

}
