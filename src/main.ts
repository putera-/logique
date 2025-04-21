import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // RUN APP
  const port = process.env.PORT ?? 5555;
  await app.listen(port);
  console.log(`App is running at http://localhost:${port}`)
}
bootstrap();
