'use strict';

const path = require('path');

function loadSettings(env = process.env) {
  return {
    port: Number(env.PORT || 3000),
    mongoUri: env.MONGO_URI || 'mongodb://127.0.0.1:27017/lockerline',
    seedDir: path.join(__dirname, '..', 'seed'),
    freeWindowHours: Number(env.FREE_WINDOW_HOURS || 48),
    codeHashKey: env.CODE_HASH_KEY || 'lockerline-development-key',
  };
}

module.exports = { loadSettings };