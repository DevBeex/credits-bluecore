import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { configureHttp } from '../src/common/configure-http';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    configureHttp(app);
    await app.init();
  });

  it('/api/v1 (GET)', () => {
  return request(app.getHttpServer())
    .get('/api/v1')
    .expect(200)
    .expect('Hello World!');
});

  afterEach(async () => {
    await app.close();
  });
});
