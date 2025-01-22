import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DataFetchModule } from './data-fetch/data-fetch.module';

@Module({
  imports: [DataFetchModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
