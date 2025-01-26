import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configValidationSchema } from './config/config.validation';
import { DataFetchModule } from './data-fetch/data-fetch.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      validationSchema: configValidationSchema,
      cache: true,
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        autoLoadEntities: configService.get('NODE_ENV') === 'dev',
        synchronize: configService.get('NODE_ENV') === 'dev',
        entities:
          configService.get('NODE_ENV') === 'prod'
            ? [__dirname + '/**/*.entity{.ts,.js}']
            : undefined,
      }),
    }),
    DataFetchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
