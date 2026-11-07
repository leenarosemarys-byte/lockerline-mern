'use strict';

const express = require('express');
const request = require('supertest');
const { makePickupRouter } = require('../src/pickups/router');
const { errorHandler } = require('../src/errors/middleware');
const { NoSuchCode } = require('../src/errors');

/** The pickup router and the error middleware alone: a fake service, no createApp, no database. */
function appWith(service) {
  const app = express();

  app.use(express.json());
  app.use(makePickupRouter(service));
  app.use(errorHandler);

  return app;
}

test('a NoSuchCode thrown by the service becomes a 404 no-such-code problem', async () => {
  const service = { pickup: jest.fn().mockRejectedValue(new NoSuchCode()) };

  const res = await request(appWith(service)).post('/pickups').send({ code: '123456' });

  expect(service.pickup).toHaveBeenCalledWith('123456');
  expect(res.status).toBe(404);
  expect(res.headers['content-type']).toMatch(/application\/problem\+json/);
  expect(res.body.type).toBe('/errors/no-such-code');
});