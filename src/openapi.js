
'use strict';

const doors = require('./doors/docs');
const drops = require('./drops/docs');
const pickups = require('./pickups/docs');
const parcels = require('./parcels/docs');

/** The OpenAPI 3 document, put together from each feature's own description. */
const document = {
  openapi: '3.0.3',
  info: { title: 'LockerLine', version: '1.0.0', description: 'The parcel room of one apartment tower.' },
  tags: [
    { name: 'doors', description: 'The wall of 48 doors' },
    { name: 'drops', description: 'A courier leaves a parcel' },
    { name: 'pickups', description: 'A resident collects with a code' },
    { name: 'parcels', description: 'One parcel and its history' },
  ],
  paths: { ...doors.paths, ...drops.paths, ...pickups.paths, ...parcels.paths },
};

module.exports = { document };
