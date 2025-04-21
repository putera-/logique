import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // APP VERSIONING
    app.enableVersioning({
        type: VersioningType.URI,
    });

    // SWAGGER DOCUMENTATION
    const config = new DocumentBuilder()
        .setTitle('Logique - Rizjami Putera')
        .setDescription('Logique Technical Test -  API description')
        .setVersion('1.0')
        .build();
    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, documentFactory);

    // GLOBAL VALIDATION PIPE
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true, // strips properties not in DTO
            forbidNonWhitelisted: true,
        }),
    );

    // RUN APP
    const port = process.env.PORT ?? 5555;
    await app.listen(port);
    console.log(`App is running at http://localhost:${port}`);
}
bootstrap();
