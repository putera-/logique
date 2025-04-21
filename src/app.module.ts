import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { BooksModule } from './books/books.module';

@Module({
    imports: [
        ConfigModule.forRoot(),
        BooksModule, // to load .env file
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
