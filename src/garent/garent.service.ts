import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGarentDto } from './dto/GarentDto.dto';
import { JwtUser } from '../user/strategy/jwt-user.interface';
import { v4 as uuidv4 } from 'uuid';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class GarentService {
  constructor(private mailerService: MailerService,private prisma: PrismaService) {}

  async createGarent(dto: CreateGarentDto, userId: number) {
    return this.prisma.garent.create({
      data: {
        garentId:userId,
        userUserId: userId,
        ...dto,
      },
    });
  }

  async editGarent(dto: CreateGarentDto, GarentId: number, user: JwtUser) {
    const garent = await this.prisma.garent.findUnique({ where: { garentId:GarentId } });

    if (!garent) {
      throw new NotFoundException('garent not found');
    }

    if (!user.roles.includes('Admin') && garent.userUserId !== user.userId) {
      throw new ForbiddenException('You can only edit your own garents');
    }

    return this.prisma.garent.update({
      where: { garentId:GarentId },
      data: { ...dto },
    });
  }

  async deleteGarent(garentId: number, user: JwtUser) {
    const garent = await this.prisma.garent.findUnique({ where: { garentId } });

    if (!garent) {
      throw new NotFoundException('garent not found');
    }

    if (!user.roles.includes('Admin') && garent.userUserId !== user.userId) {
      throw new ForbiddenException('You can only delete your own garents');
    }

    return this.prisma.garent.delete({ where: { garentId } });
  }

  async searchGarents(query: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: number;
    sortBy?: string | string[];
    page?: string;
    size?: string;
  }, user: JwtUser) {
    const { firstName, lastName, phoneNumber, sortBy, page = '1', size = '10' } = query;
    const pageNum = parseInt(page, 10);
    const sizeNum = parseInt(size, 10);
    const skip = (pageNum - 1) * sizeNum;

    const filters: any = {};
    if (!user.roles.includes('Admin')) filters.userUserId = user.userId;
    if (firstName) filters.firstName = { contains: firstName, mode: 'insensitive' };
    if (lastName) filters.lastName = { contains: lastName, mode: 'insensitive' };
    if (phoneNumber) filters.phoneNumber = phoneNumber;

    const orderBy = (typeof sortBy === 'string' ? [sortBy] : sortBy || []).map(f => {
      const [key, dir = 'asc'] = f.split(':');
      return { [key]: dir.toLowerCase() === 'desc' ? 'desc' : 'asc' };
    });

    const [data, total] = await Promise.all([
      this.prisma.garent.findMany({ where: filters, skip, take: sizeNum, orderBy }),
      this.prisma.garent.count({ where: filters }),
    ]);

    return { data, total, page: pageNum, size: sizeNum, totalPages: Math.ceil(total / sizeNum) };
  }
  async inviteGarent(email: string, userId: number) {
    const token = uuidv4();
    await this.prisma.garentInvitation.create({
      data: { email, token, invitedById: userId },
    });

    const confirmLink = `${process.env.FRONTEND_URL}/garent/confirm?token=${token}`;
    await this.mailerService.sendMail({
      to: email,
      subject: 'Garent Invitation',
      html: `<p>You have been invited to be a garent. Click <a href="${confirmLink}">here</a> to accept.</p>`
    });

    return { message: 'Invitation sent' };
  }
  async confirmInvitation(token: string) {
    const invitation = await this.prisma.garentInvitation.findUnique({ where: { token } });
    if (!invitation) throw new NotFoundException('Invalid token');

    const invitedUser = await this.prisma.user.findUnique({ where: { email: invitation.email } });
    if (!invitedUser) throw new NotFoundException('User not registered');

    await this.prisma.garent.create({
      data: {
        garentId: invitedUser.userId,
        userUserId: invitation.invitedById,
        firstName: invitedUser.firstName,
        lastName: invitedUser.lastName,
        phoneNumber: invitedUser.phoneNumber,
      },
    });

    await this.prisma.garentInvitation.delete({ where: { token } });

    return { message: 'You are now a garent.' };
  }

  async checkIfUserHasGarent(userId: number): Promise<boolean> {
    const garent = await this.prisma.garent.findFirst({
      where: { userUserId: userId },
    });
    return !!garent;
  }
}
