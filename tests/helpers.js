'use strict';

const { MongoMemoryReplSet } = require('mongodb-memory-server');
const request = require('supertest');

const { connect, disconnect } = require('../src/db');
const { seed } = require('../src/seed');
const { createApp } = require('../src/app');
const { loadSettings } = require('../src/settings');

function testDatabase(name) {
  let mongo;
  let settings;

  const clock = {
    now: () => new Date('2026-09-25T13:10:00Z'),
  };

  return {
    get settings() {
      return settings;
    },

    async start() {
      mongo = await MongoMemoryReplSet.create();
      await connect(mongo.getUri(name));
      settings = loadSettings();
      await seed({ settings, clock });
    },

    async stop() {
      await disconnect();
      if (mongo) {
        await mongo.stop();
      }
    },

    api() {
      return request(createApp({ settings, clock }));
    },
  };
}

module.exports = { testDatabase };