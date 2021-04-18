import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { typeOrmConfig } from './config/typeOrm.config';
import { PostModule } from './post/post.module';

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), AuthModule, PostModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
