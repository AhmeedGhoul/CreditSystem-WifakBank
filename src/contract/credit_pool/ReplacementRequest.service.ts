import { v4 as uuidv4 } from 'uuid';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class ReplacementRequestService {
  constructor(
    private prisma: PrismaService,
    private mailerService: MailerService,
  ) {}

  async sendReplacementRequest(creditPoolId: number, replacementEmail: string, userId: number) {
    const pool = await this.prisma.credit_Pool.findUnique({
      where: { creditPoolId },
      include: { contracts: true },
    });
    if (!pool) throw new NotFoundException('Credit pool not found');

    const userContract = pool.contracts.find(c => c.userUserId === userId);
    if (!userContract) throw new BadRequestException('You are not part of this credit pool');

    if (!pool.isFull) {
      throw new BadRequestException("Credit pool isn't full, no replacement needed");
    }

    const confirmationToken = uuidv4();

    const replacementRequest = await this.prisma.replacementRequest.create({
      data: {
        creditPoolId,
        userId,
        replacementEmail,
        status: 'PENDING',
        confirmationToken,
      },
    });
      const confirmUrl = `http://localhost:3001/replacement/confirm?token=${confirmationToken}`;

    await this.mailerService.sendMail({
      to: replacementEmail,
      subject: 'Replacement Request Confirmation',
      html: `
        <p>You have been requested to replace a user in a credit pool.</p>
        <p>Please <a href="${confirmUrl}">click here to confirm your acceptance</a>.</p>
        <p>If you did not expect this, you can ignore this email.</p>
      `,
    });

    return {
      message: 'Replacement request sent and pending acceptance',
      replacementRequest,
    };
  }
  async confirmReplacement(token: string) {
    const request = await this.prisma.replacementRequest.findUnique({
      where: { confirmationToken: token },
      include: { creditPool: { include: { contracts: true } }, user: true },
    });

    if (!request) throw new NotFoundException('Invalid confirmation token');

    if (request.status !== 'PENDING') {
      throw new BadRequestException('This request has already been processed');
    }

    const { creditPoolId, userId, replacementEmail } = request;

    const pool = request.creditPool;
    const originalContract = pool.contracts.find(c => c.userUserId === userId);
    if (!originalContract) throw new BadRequestException('Original user contract not found');

    const replacementUser = await this.prisma.user.findUnique({
      where: { email: replacementEmail },
    });
    if (!replacementUser) {
      throw new NotFoundException('Replacement user not found. They must register first.');
    }



    await this.prisma.contracts.update({
      where: { contractId: originalContract.contractId },
      data: { userUserId: replacementUser.userId },
    });

    await this.prisma.replacementRequest.update({
      where: { id: request.id },
      data: { status: 'ACCEPTED' },
    });


    return { message: 'Replacement confirmed successfully.' };
  }

}
