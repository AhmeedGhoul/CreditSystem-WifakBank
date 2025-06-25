import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RoleSeederService {
  constructor(private prisma: PrismaService) {}

  async seedRoles() {
    const roles = ['Admin', 'Client', 'Auditor', 'Agent'];

    for (const roleName of roles) {
      const existing = await this.prisma.role.findUnique({
        where: { name: roleName },
      });

      if (!existing) {
        await this.prisma.role.create({
          data: { name: roleName },
        });
      }
    }
  }
}
