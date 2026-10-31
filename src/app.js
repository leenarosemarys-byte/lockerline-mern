'use strict';
const express = require('express');
const doorRepository = require('./doors/repository');
const { makeDoorService } = require('./doors/service');
const { makeDoorRouter } = require('./doors/router');
const { notFound, errorHandler } = require('./errors/middleware');

/** Builds the Express app. It never connects to the database and never listens: server.js and tests do that. */
function createApp({ settings, clock }) {
  const app = express();
  const doors = makeDoorService({ repository: doorRepository });

  app.use(makeDoorRouter(doors));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
