'use strict';

const { MongoMemoryReplSet } = require('mongodb-memory-server');
const request = require('supertest');
const mongoose = require('mongoose');

const { connect, disconnect } = require('../src/db');
const { seed } = require('../src/seed');
const { createApp } = require('../src/app');
const { loadSettings } = require('../src/settings');
const doorRepository = require('../src/doors/repository');

const clock = {
  now: () => new Date('2026-09-25T13:10:00Z'),
};

let mongo;
let settings;

beforeAll(async () => {
 mongo = await MongoMemoryReplSet.create();
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

  const res = await request(createApp({ settings, clock }))
    .get('/towers/A/doors');

  expect(res.status).toBe(200);
  expect(res.body.doors).toHaveLength(48);
  expect(res.body.free).toBe(48);
});

test('the large filter gives exactly the 8 large doors', async () => {
  const res = await request(createApp({ settings, clock }))
    .get('/towers/A/doors?size=L');

  expect(res.status).toBe(200);
  expect(res.body.doors).toHaveLength(8);
  expect(res.body.doors.every((d) => d.size === 'L')).toBe(true);
});

test('an unknown size is a 400 validation problem', async () => {
  const res = await request(createApp({ settings, clock }))
    .get('/towers/A/doors?size=XL');

  expect(res.status).toBe(400);
  expect(res.body.type).toBe('/errors/validation');
});

test('an unknown door is a 404 no-such-door problem', async () => {
  const res = await request(createApp({ settings, clock }))
    .get('/towers/A/doors/D99');

  expect(res.status).toBe(404);
  expect(res.body.type).toBe('/errors/no-such-door');
});

test('POST /drops returns 400 /errors/validation for a malformed body', async () => {
  const res = await request(createApp({ settings, clock }))
    .post('/drops')
    .send({ sizeClass: 'XL', flat: '101' });

  expect(res.status).toBe(400);
  expect(res.headers['content-type']).toMatch(/application\/problem\+json/);
  expect(res.body.type).toBe('/errors/validation');
});

test('POST /drops returns 400 /errors/no-such-flat for an unknown flat', async () => {
  const res = await request(createApp({ settings, clock }))
    .post('/drops')
    .send({ sizeClass: 'M', flat: '999' });

  expect(res.status).toBe(400);
  expect(res.headers['content-type']).toMatch(/application\/problem\+json/);
  expect(res.body.type).toBe('/errors/no-such-flat');

  const parcelCount = await mongoose.connection
    .collection('parcels')
    .countDocuments();

  expect(parcelCount).toBe(0);

  const freeDoors = await mongoose.connection
    .collection('doors')
    .countDocuments({ currentParcelId: null });

  expect(freeDoors).toBe(48);
});

test('POST /drops returns 500 and rolls back when the door write fails', async () => {
  const holdSpy = jest
    .spyOn(doorRepository, 'hold')
    .mockRejectedValueOnce(new Error('Forced door write failure'));

  try {
    const res = await request(createApp({ settings, clock }))
      .post('/drops')
      .send({ sizeClass: 'M', flat: '101' });

    expect(res.status).toBe(500);

    const parcelCount = await mongoose.connection
      .collection('parcels')
      .countDocuments();

    expect(parcelCount).toBe(0);

    const heldDoors = await mongoose.connection
      .collection('doors')
      .countDocuments({ currentParcelId: { $ne: null } });

    expect(heldDoors).toBe(0);

    const freeDoors = await mongoose.connection
      .collection('doors')
      .countDocuments({ currentParcelId: null });

    expect(freeDoors).toBe(48);
  } finally {
    holdSpy.mockRestore();
  }
});
