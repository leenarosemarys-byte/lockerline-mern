'use strict';

const mongoose = require('mongoose');
const request = require('supertest');
const { createApp } = require('../src/app');
require('../src/events/repository');
const { testDatabase } = require('./helpers');

const db = testDatabase('events');

beforeAll(() => db.start());

afterAll(() => db.stop());

test('a dropped, then collected parcel shows dropped, code_issued and opened, in order', async () => {
  const drop = await db.api().post('/drops').send({ sizeClass: 'M', flat: '302' });
  const later = { now: () => new Date('2026-09-26T09:10:00Z') };
  await request(createApp({ settings: db.settings, clock: later })).post('/pickups').send({ code: drop.body.code });

  const res = await db.api().get(`/parcels/${drop.body.parcelId}`);

  expect(res.body.events.map((e) => e.kind)).toEqual(['dropped', 'code_issued', 'opened']);
  expect(res.body.events[2].at).toBe('2026-09-26T09:10:00Z');
});

test('an event cannot be changed or deleted', async () => {
  const Event = mongoose.model('Event');

  await expect(Event.updateOne({}, { $set: { kind: 'opened' } })).rejects.toThrow('append-only');
  await expect(Event.deleteMany({})).rejects.toThrow('append-only');
  expect(await Event.countDocuments()).toBeGreaterThan(0);
});
