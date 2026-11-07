'use strict';
const mongoose = require('mongoose');

/** 
 * Opens Mongoose's default connection on the database the URI names, then waits until every model's unique indexes
 * exist, so no write (the seed of a second start included) can slip in before them.
 */
  async function connect(uri) {
  await mongoose.connect(uri);
  await Promise.all(Object.values(mongoose.models).map((model) => model.init()));
}

async function disconnect() {
  await mongoose.disconnect();
}

/**
 * Runs work(session) in one MongoDB transaction: every read and write inside must be given the session. If any of
 * them fails, nothing of it is kept.
 */
async function inTransaction(work) {
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await work(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
}

module.exports = { connect, disconnect, inTransaction };
