'use strict';

const express = require('express');
const swaggerUi = require('swagger-ui-express');
const { document } = require('./openapi');
const db = require('./db');
const doorRepository = require('./doors/repository');
const parcelRepository = require('./parcels/repository');
const eventRepository = require('./events/repository');

const { makeDoorService } = require('./doors/service');
const { makeDoorRouter } = require('./doors/router');

const { makeDropService } = require('./drops/service');
const { makeDropRouter } = require('./drops/router');

const { makeParcelService } = require('./parcels/service');
const { makeParcelRouter } = require('./parcels/router');

const { makePickupService } = require('./pickups/service');
const { makePickupRouter } = require('./pickups/router');

const { makeLastRoute, errorHandler } = require('./errors/middleware');

function createApp({ settings, clock }) {
  const app = express();

  app.use(express.json());
  app.get('/openapi.json', (req, res) => res.json(document));
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(document));

  const doors = makeDoorService({
    repository: doorRepository,
    parcels: parcelRepository,
    clock,
  });

  const drops = makeDropService({
    doors: doorRepository, parcels: parcelRepository, events: eventRepository, settings, clock, inTransaction: db.inTransaction,
  });

  const parcels = makeParcelService({ repository: parcelRepository, events: eventRepository });

  const pickups = makePickupService({
    parcels: parcelRepository, doors: doorRepository, events: eventRepository, settings, clock, inTransaction: db.inTransaction,
  });

  app.use(makeDoorRouter(doors));
  app.use(makeDropRouter(drops));
  app.use(makeParcelRouter(parcels));
  app.use(makePickupRouter(pickups));

  app.use(makeLastRoute(document.paths));
  app.use(errorHandler);

  return app;
}

module.exports = { createApp };