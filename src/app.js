'use strict';
const express = require('express');

const db = require('./db');
const doorRepository = require('./doors/repository');
const parcelRepository = require('./parcels/repository');

const { makeDoorService } = require('./doors/service');
const { makeDoorRouter } = require('./doors/router');

const { makeDropService } = require('./drops/service');
const { makeDropRouter } = require('./drops/router');

const { makeParcelService } = require('./parcels/service');
const { makeParcelRouter } = require('./parcels/router');

const { notFound, errorHandler } = require('./errors/middleware');

function createApp({ settings, clock }) {
  const app = express();

  app.use(express.json());

  const doors = makeDoorService({
    repository: doorRepository,
    parcels: parcelRepository,
    clock,
  });

  const drops = makeDropService({
    repository: doorRepository,
    parcels: parcelRepository,
    db,
    clock,
  });

  const parcels = makeParcelService({
    repository: parcelRepository,
  });

  app.use(makeDoorRouter(doors));
  app.use(makeDropRouter(drops));
  app.use(makeParcelRouter(parcels));

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };
