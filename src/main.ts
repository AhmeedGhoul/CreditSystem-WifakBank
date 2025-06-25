import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { RoleSeederService } from 'src/user/role-seeder.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const roleSeeder = app.get(RoleSeederService);
  await roleSeeder.seedRoles(); // seed roles at startup

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
