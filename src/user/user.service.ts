import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, UserLoginDto } from './dto/UserDto.dto';
import * as argon from 'argon2';
import { PrismaClientKnownRequestError } from 'generated/prisma/runtime/library';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Role } from '../../generated/prisma';
@Injectable()
export class UserService {
  constructor(private prisma:PrismaService,private jwt : JwtService,private config:ConfigService) {
    }

  async signup(dto: CreateUserDto) {
    const hash = await argon.hash(dto.password);

    const { password, Role, ...rest } = dto;

    const roleName = Role ?? 'Client';

    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new ForbiddenException(`Role "${roleName}" does not exist`);
    }

    try {
      return await this.prisma.user.create({
        data: {
          ...rest,
          password: hash,
          roles: {
            connect: [{ id: role.id }],
          },
        },
        include: {
          roles: true,
        },
      });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ForbiddenException('Email is already taken');
      }
      throw error;
    }
  }

  async signin(dto: UserLoginDto): Promise<{ access_token: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { roles: true },
    });

    if (!user) {
      throw new ForbiddenException('Incorrect credentials');
    }

    const isPasswordValid = await argon.verify(user.password, dto.password);
    if (!isPasswordValid) {
      throw new ForbiddenException('Incorrect credentials');
    }

    const roleNames = user.roles.map(role => role.name);
    return this.signToken(user.userId, roleNames); // retourne le token
  }
async editUser(dto:UpdateUserDto,userId:number){
    const  user=await this.prisma.user.findUnique({where:{
      userId:userId
      }})
  if(!user){
    throw new ForbiddenException("incorrect credentials")
  }
  return this.prisma.user.update({
    where: {
      userId: userId
    },
    data: {
      ...dto,
    },
  });
}
async deleteUser(userid:number){
    await this.prisma.user.delete({where:{userId:userid}});
}
  async searchUsers(query: {
    email?: string;
    firstName?: string;
    lastName?: string;
    isEnabled?: string;
    isAccountBlocked?: string;
    sortBy?: string | string[];
    page?: string;
    size?: string;
  }) {
    const {
      email,
      firstName,
      lastName,
      isEnabled,
      isAccountBlocked,
      sortBy,
      page = '1',
      size = '10',
    } = query;

    const filters: any = {};

    const searchConditions: any[] = [];

    if (email) {
      searchConditions.push({ email: { contains: email, mode: 'insensitive' } });
    }
    if (firstName) {
      searchConditions.push({ firstName: { contains: firstName, mode: 'insensitive' } });
    }
    if (lastName) {
      searchConditions.push({ lastName: { contains: lastName, mode: 'insensitive' } });
    }

    if (searchConditions.length > 0) {
      filters.OR = searchConditions;
    }
    if (isEnabled !== undefined) filters.isEnabled = isEnabled === 'true';
    if (isAccountBlocked !== undefined) filters.isAccountBlocked = isAccountBlocked === 'true';

    const pageNum = parseInt(page, 10);
    const sizeNum = parseInt(size, 10);
    const skip = (pageNum - 1) * sizeNum;

    const orderBy = (typeof sortBy === 'string' ? [sortBy] : sortBy || []).map((f) => {
      const [key, dir = 'asc'] = f.split(':');
      return { [key]: dir.toLowerCase() === 'desc' ? 'desc' : 'asc' };
    });

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where: filters,
        skip,
        take: sizeNum,
        orderBy,
        include: {
          roles: true,
        },
      }),
      this.prisma.user.count({ where: filters }),
    ]);
    return {
      data,
      total,
      page: pageNum,
      size: sizeNum,
      totalPages: Math.ceil(total / sizeNum),
    };
  }

  async grantRole(userid:number, roleName: string){
  const role = await this.prisma.role.findUnique({
    where: { name: roleName },
  });

  if (!role) {
    throw new Error(`Role "${roleName}" not found`);
  }
  return this.prisma.user.update({
    where: { userId: userid },
    data: {
      roles: {
        connect: { id: role.id },
      },
    },
    include: { roles: true },
  });}
  async DemoteRole(userid:number, roleName: string){
    const role = await this.prisma.role.findUnique({
      where: { name: roleName },
    });

    if (!role) {
      throw new Error(`Role "${roleName}" not found`);
    }
    return this.prisma.user.update({
      where: { userId: userid },
      data: {
        roles: {
          disconnect: { id: role.id },
        },
      },
      include: { roles: true },
    });}
  async signToken(userId: number, roles: string[]): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      roles,
    };

    const secret = this.config.get<string>("JWT_SECRET_KEY");
    const token = await this.jwt.signAsync(payload, {
      expiresIn: '1h',
      secret,
    });

    return {
      access_token: token,
    };
  }
  async userHasAccess(userId: number): Promise<boolean> {
    const request = await this.prisma.request.findFirst({
      where: {
        userUserId: userId,
        isRequestApprovedByAgent: true,
        isRequestApprovedByAuditor: true,
      },
    });
    return !!request;
  }


}
