'use strict';

const { refusal, problem, ok } = require('../docs');

const paths = {
  '/pickups': {
    post: {
      tags: ['pickups'],
      summary: 'A resident keys a code: the door opens once and the parcel is collected',
      requestBody: { required: true, content: { 'application/json': { example: { code: '482913' } } } },
      responses: {
        200: ok('The door opened', { parcelId: 'P017', door: 'D22', openedAt: '2026-09-27T09:12:00Z', dwellSeconds: 158520 }),
        400: refusal('The body fails validation', problem(400, '/errors/validation', 'Invalid request',
          'The request is not valid', '/pickups', { errors: [{ field: 'code', message: 'Required' }] })),
        404: refusal(
          'The code does not exist, or its window has passed',
          problem(404, '/errors/no-such-code', 'No such code', 'There is no parcel waiting for this code', '/pickups'),
          problem(404, '/errors/code-expired', 'Code expired', 'The free window of this code has passed', '/pickups')),
        409: refusal(
          'The code has already opened its door',
          problem(409, '/errors/code-used', 'Code used', 'This code has already opened its door', '/pickups')),
      },
    },
  },
};

module.exports = { paths };
