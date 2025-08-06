import { RoleSeederService } from './user/role-seeder.service';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });
  if (typeof global.crypto === 'undefined' || !global.crypto?.randomUUID) {
    Object.defineProperty(global, 'crypto', {
      value: require('crypto'),
    });
  }
  const roleSeeder = app.get(RoleSeederService);
  await roleSeeder.seedRoles();
  app.use(cookieParser());
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
