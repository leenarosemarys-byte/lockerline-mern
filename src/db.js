'use strict';
const mongoose = require('mongoose');

/** Opens Mongoose's default connection on the database the URI names. */
async function connect(uri) {
  await mongoose.connect(uri);
}

async function disconnect() {
  await mongoose.disconnect();
}

module.exports = { connect, disconnect };