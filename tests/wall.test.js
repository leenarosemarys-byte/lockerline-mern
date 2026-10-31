'use strict';
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const { connect, disconnect } = require('../src/db');
const { seed } = require('../src/seed');
const { createApp } = require('../src/app');
const { loadSettings } = require('../src/settings');

const clock = { now: () => new Date('2026-09-25T13:10:00Z') };
let mongo;
let settings;

beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await connect(mongo.getUri('wall'));
  settings = loadSettings();
});

afterAll(async () => {
  await disconnect();
  await mongo.stop();
});

test('starting twice still gives 48 doors, all free', async () => {
  await seed({ settings, clock });
  await seed({ settings, clock });

  const res = await request(createApp({ settings, clock })).get('/towers/A/doors');

  expect(res.status).toBe(200);
  expect(res.body.doors).toHaveLength(48);
  expect(res.body.free).toBe(48);
});

test('the large filter gives exactly the 8 large doors', async () => {
  const res = await request(createApp({ settings, clock })).get('/towers/A/doors?size=L');

  expect(res.body.doors).toHaveLength(8);
  expect(res.body.doors.every((d) => d.size === 'L')).toBe(true);
});

test('an unknown size is a 400 validation problem', async () => {
  const res = await request(createApp({ settings, clock })).get('/towers/A/doors?size=XL');

  expect(res.status).toBe(400);
  expect(res.body.type).toBe('/errors/validation');
});

test('an unknown door is a 404 no-such-door problem', async () => {
  const res = await request(createApp({ settings, clock })).get('/towers/A/doors/D99');

  expect(res.status).toBe(404);
  expect(res.body.type).toBe('/errors/no-such-door');
});
