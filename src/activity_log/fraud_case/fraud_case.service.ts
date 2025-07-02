// fraud_case.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFraudCaseDto } from './dto/Fraud_CaseDto.dto';

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

  async getFraudCases() {
    return this.prisma.fraud_Case.findMany({
      include: { audit: true },
    });
  }

  async getFraudCaseById(fraudCaseId: number) {
    const caseItem = await this.prisma.fraud_Case.findUnique({
      where: { fraudCaseId },
      include: { audit: true },
    });
    if (!caseItem) throw new NotFoundException('Fraud case not found');
    return caseItem;
  }
}
