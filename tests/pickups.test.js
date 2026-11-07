'use strict';

const request = require('supertest');
const { createApp } = require('../src/app');
const { testDatabase } = require('./helpers');

const db = testDatabase('pickups');

const fixedClock = {
  now: () => new Date('2026-09-25T13:10:00Z'),
};

beforeAll(() => db.start());
afterAll(() => db.stop());

test('a code that never existed is a 404 no-such-code', async () => {
  await db.api().post('/drops').send({
    sizeClass: 'M',
    flat: '302',
  });

  const res = await db.api()
    .post('/pickups')
    .send({ code: '000000' });

  expect(res.status).toBe(404);
  expect(res.body.type).toBe('/errors/no-such-code');
});

test('a code whose 48-hour window has passed is a 404 code-expired', async () => {
  const dropApp = createApp({
    settings: db.settings,
    clock: fixedClock,
  });

  const drop = await request(dropApp)
    .post('/drops')
    .send({
      sizeClass: 'S',
      flat: '101',
    });

  expect(drop.status).toBe(201);

  const threeDaysLater = {
    now: () => new Date('2026-09-28T13:10:00Z'),
  };

  const pickupApp = createApp({
    settings: db.settings,
    clock: threeDaysLater,
  });

  const res = await request(pickupApp)
    .post('/pickups')
    .send({ code: drop.body.code });

  expect(res.status).toBe(404);
  expect(res.body.type).toBe('/errors/code-expired');
});