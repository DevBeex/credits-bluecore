import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { configureHttp, configureNotFoundHandler } from './common/configure-http';
import { Environment } from './config/environment.validation';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const environment = config.getOrThrow<Environment>('environment');
  configureHttp(app)
  app.enableShutdownHooks();
  await app.init();
  configureNotFoundHandler(app);
  await app.listen(environment.PORT);
}
void bootstrap();
