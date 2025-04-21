import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';
import { BooksModule } from './books/books.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';

@Module({
    imports: [
        CacheModule.register({
            isGlobal: true
        }),
        ThrottlerModule.forRoot({
            throttlers: [
                {
                    ttl: 60000,
                    limit: 10,
                },
            ],
        }),
        ConfigModule.forRoot(),
        BooksModule,
    ],
    controllers: [AppController],
    providers: [],
})
export class AppModule { }
