import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const typeOrmConfigAsync = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => ({
    type: 'mysql',
    host: process.env.DB_HOST || configService.get('DB_HOST'),
    port:
      parseInt(process.env.DB_PORT, 3306) ||
      configService.get<number>('DB_PORT'),
    username: process.env.DB_USERNAME || configService.get('DB_USERNAME'),
    password: process.env.DB_PASSWORD || configService.get('DB_PASSWORD'),
    database: process.env.DB_DATABASE || configService.get('DB_DATABASE'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
  }),
};
