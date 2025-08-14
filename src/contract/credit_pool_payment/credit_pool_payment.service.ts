import {
  ForbiddenException,
  Injectable, Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtUser } from '../../user/strategy/jwt-user.interface';
import { CreateCreditPoolPaymentDto } from './dto/CreditPoolPaymentDto.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class CreditpoolpaymentService {
  constructor(private prisma: PrismaService) {
  }

  private logger = new Logger(CreditpoolpaymentService.name);

  async createCreditPoolPayment(dto: CreateCreditPoolPaymentDto, contractId: number, user: JwtUser) {
    const contract = await this.prisma.contracts.findUnique({
      where: { contractId },
    });

    if (!contract) throw new NotFoundException('contract not found');

    if (!user.roles.includes('Admin') && contract.userUserId !== user.userId) {
      throw new ForbiddenException('You cannot add credit pool payments to a contract that is not yours');
    }

    return this.prisma.credit_Pool_Payment.create({
      data: {
        ...dto,
        contractId: contractId,
      },
    });
  }

  async editCreditPoolPayment(dto: CreateCreditPoolPaymentDto, credit_Pool_PaymentId: number, user: JwtUser) {
    const credit_Pool_Payment = await this.prisma.credit_Pool_Payment.findUnique({
      where: { creditPoolPaymentId: credit_Pool_PaymentId },
      include: { contract: true },
    });

    if (!credit_Pool_Payment) throw new NotFoundException('credit pool payment not found');

    if (!user.roles.includes('Admin') && credit_Pool_Payment.contract?.userUserId !== user.userId) {
      throw new ForbiddenException('You can only edit credit pool payments linked to your own contract');
    }

    return this.prisma.credit_Pool_Payment.update({
      where: { creditPoolPaymentId: credit_Pool_PaymentId },
      data: { ...dto },
    });
  }

  async deleteCreditPoolPayment(creditpoolpaymentId: number, user: JwtUser) {
    const credit_Pool_Payment = await this.prisma.credit_Pool_Payment.findUnique({
      where: { creditPoolPaymentId: creditpoolpaymentId },
      include: { contract: true },
    });

    if (!credit_Pool_Payment) throw new NotFoundException('CreditPool Payment not found');

    if (!user.roles.includes('Admin') && credit_Pool_Payment.contract?.userUserId !== user.userId) {
      throw new ForbiddenException('You can only delete credit pool payments linked to your own contract');
    }

    return this.prisma.credit_Pool_Payment.delete({ where: { creditPoolPaymentId: creditpoolpaymentId } });
  }

  async searchCreditPoolPayments(query: {
    contractId: number;
    minAmount?: string;
    maxAmount?: string;
    date?: string;
    sortBy?: string | string[];
    page?: string;
    size?: string;
  }, user: JwtUser) {
    const { contractId, minAmount, maxAmount, date, sortBy, page = '1', size = '10' } = query;
    const contract = await this.prisma.contracts.findUnique({ where: { contractId } });
    if (!contract) throw new NotFoundException('Contract not found');
    if (!user.roles.includes('Admin') && contract.userUserId !== user.userId)
      throw new ForbiddenException('Access denied');

    const filters: any = { contractId };
    if (minAmount || maxAmount) {
      filters.amount = {};
      if (minAmount) filters.amount.gte = minAmount;
      if (maxAmount) filters.amount.lte = maxAmount;
    }
    if (date) filters.date = { contains: date, mode: 'insensitive' };

    const pageNum = parseInt(page, 10);
    const sizeNum = parseInt(size, 10);
    const skip = (pageNum - 1) * sizeNum;

    const orderBy = (typeof sortBy === 'string' ? [sortBy] : sortBy || []).map(f => {
      const [key, dir = 'asc'] = f.split(':');
      return { [key]: dir.toLowerCase() === 'desc' ? 'desc' : 'asc' };
    });

    const [data, total] = await Promise.all([
      this.prisma.credit_Pool_Payment.findMany({ where: filters, skip, take: sizeNum, orderBy }),
      this.prisma.credit_Pool_Payment.count({ where: filters }),
    ]);

    return { data, total, page: pageNum, size: sizeNum, totalPages: Math.ceil(total / sizeNum) };
  }

  async getUserCalendarPayments(userId: number) {
    const contracts = await this.prisma.contracts.findMany({
      where: { userUserId: userId },
      include: {
        credit_Pool: true,
        credit_Pool_Payment: true,
      },
    });

    const events = contracts.flatMap(contract => {
      return contract.credit_Pool_Payment.map(payment => {
        const amount = contract.amount / contract.frequency;


        return {
          title: `Payment of ${payment.amount} DT`,
          date: payment.PaymentDate,
          contractId: contract.contractId,
          amount: amount,
          creditPoolId: contract.creditPoolId,
          isPaid: payment.isPayed,
          paymentId: payment.creditPoolPaymentId,
        };
      });
    });

    return events;
  }

  async payCreditPoolPayment(paymentId: number, user: JwtUser) {
    const payment = await this.prisma.credit_Pool_Payment.findUnique({
      where: { creditPoolPaymentId: paymentId },
      include: { contract: true },
    });

    if (!payment) throw new NotFoundException('Payment not found');
    if (!payment.contract || payment.contract.userUserId !== user.userId) {
      throw new ForbiddenException('You can only pay your own payments');
    }
    if (payment.isPayed) throw new ForbiddenException('Already paid');

    const account = await this.prisma.account.findFirst({ where: { linkedUserId: user.userId } });
    if (!account) throw new NotFoundException('Account not found');

    if (account.balance < payment.amount) {
      throw new ForbiddenException('Not enough balance');
    }

    await this.prisma.account.update({
      where: { accountId: account.accountId },
      data: { balance: account.balance - payment.amount },
    });

    return this.prisma.credit_Pool_Payment.update({
      where: { creditPoolPaymentId: paymentId },
      data: { isPayed: true },
    });
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkPaymentsAndPenalties() {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    const allContracts = await this.prisma.contracts.findMany({
      where: {
        isCashouted: false,
        credit_Pool: {  
          isFull: true,
        },
      },
      include: {
        credit_Pool: true,
        User: true,
      },
    });

    for (const contract of allContracts) {
      const { rank, contractDate, frequency, isCashouted, credit_Pool, userUserId } = contract;
      const payoutDate = new Date(contractDate);
      payoutDate.setMonth(payoutDate.getMonth() + (rank - 1) * frequency);

      const isToday =
        payoutDate.getFullYear() === today.getFullYear() &&
        payoutDate.getMonth() === today.getMonth() &&
        payoutDate.getDate() === today.getDate();

      if (isToday && !isCashouted && userUserId) {
        const account = await this.prisma.account.findFirst({
          where: { linkedUserId: userUserId },
        });

        if (account) {
          await this.prisma.account.update({
            where: { accountId: account.accountId },
            data: {
              balance: account.balance + credit_Pool!.FinalValue,
            },
          });

          await this.prisma.contracts.update({
            where: { contractId: contract.contractId },
            data: { isCashouted: true },
          });
          console.log("winner");

          await this.prisma.notification.create({
            data: {
              userId: userUserId,
              title: "🎉 Cashout Success!",
              message: `Congratulations! As rank #${rank}, you received ${credit_Pool!.FinalValue} DT from your credit circle today.`,
            },
          });

          this.logger.log(`💸 Paid out ${credit_Pool!.FinalValue} DT to user ${userUserId} for rank ${rank}`);
        } else {
          this.logger.warn(`⚠️ No account found for user ${userUserId} for payout`);
        }
      }
    }

    const payments = await this.prisma.credit_Pool_Payment.findMany({
      where: {
        isPayed: false,
        OR: [
          { PaymentDate: { lte: nextWeek } },
          { MaximumDate: { lt: today } },
        ],
      },
      include: {
        contract: { include: { User: true } },
      },
    });

    for (const payment of payments) {
      const status =
        payment.MaximumDate < today
          ? 'OVERDUE'
          : payment.PaymentDate < today
            ? 'MISSED'
            : 'UPCOMING';

      const userId = payment.contract?.userUserId;
      if (!payment.contract || userId === null) {
        this.logger.warn(`Missing or null userUserId for contract ${payment.contract?.contractId}`);
        continue;
      }

      if (status === 'OVERDUE') {
        const account = await this.prisma.account.findFirst({
          where: { linkedUserId: userId },
        });

        let remainingAmount = payment.amount;
        let totalDeducted = 0;

        const deductionLogs: string[] = [];

        if (account && account.balance > 0) {
          const toDeduct = Math.min(account.balance, remainingAmount);
          await this.prisma.account.update({
            where: { accountId: account.accountId },
            data: { balance: { decrement: toDeduct } },
          });

          totalDeducted += toDeduct;
          remainingAmount -= toDeduct;
          deductionLogs.push(`👤 User ${userId} paid ${toDeduct} DT`);
        }

        if (remainingAmount > 0) {
          const garents = await this.prisma.garent.findMany({
            where: { userUserId: userId },
            include: { User: true },
          });

          for (const garent of garents) {
            const garentUserId = garent.garentId;
            const garentAccount = await this.prisma.account.findFirst({
              where: { linkedUserId: garentUserId },
            });

            if (garentAccount && garentAccount.balance > 0) {
              const toDeduct = Math.min(garentAccount.balance, remainingAmount);
              await this.prisma.account.update({
                where: { accountId: garentAccount.accountId },
                data: { balance: { decrement: toDeduct } },
              });

              totalDeducted += toDeduct;
              remainingAmount -= toDeduct;
              deductionLogs.push(`🧑‍🤝‍🧑 Garent ${garentUserId} paid ${toDeduct} DT`);

              if (remainingAmount <= 0) break;
            }
          }
        }

        if (totalDeducted >= payment.amount) {
          await this.prisma.credit_Pool_Payment.update({
            where: { creditPoolPaymentId: payment.creditPoolPaymentId },
            data: { isPayed: true },
          });

          this.logger.log(
            `✅ Payment of ${payment.amount} DT completed for user ${userId} via ${
              deductionLogs.length
            } source(s):\n- ${deductionLogs.join("\n- ")}`
          );
        } else {
          this.logger.warn(
            `❌ Insufficient funds: User ${userId} and guarantors could only cover ${totalDeducted} / ${payment.amount} DT`

          );
          const account1 = await this.prisma.account.findFirst({
            where: { linkedUserId: userId },
          });
          await this.prisma.account.update({
            where: { accountId: account1!.accountId },
            data: { balance: { decrement: payment.amount } },
          });
          await this.prisma.credit_Pool_Payment.update({
            where: { creditPoolPaymentId: payment.creditPoolPaymentId },
            data: { isPayed: true },
          });


        }
      }

      await this.prisma.notification.create({
        data: {
          userId: userId!,
          title:
            status === 'UPCOMING'
              ? 'Upcoming Payment Reminder'
              : status === 'MISSED'
                ? 'Missed Payment Alert'
                : 'Overdue Payment Auto-Debited',
          message:
            status === 'UPCOMING'
              ? `You have a payment of ${payment.amount} DT due on ${new Date(payment.PaymentDate).toLocaleDateString()}.`
              : status === 'MISSED'
                ? `You missed your payment of ${payment.amount} DT due on ${new Date(payment.PaymentDate).toLocaleDateString()}.`
                : `Your payment of ${payment.amount} DT was overdue and has been deducted automatically.`,
        },
      });
    }
  }
}
