
'use strict';

const { refusal, problem, ok } = require('../docs');

const paths = {
  '/drops': {
    post: {
      tags: ['drops'],
      summary: 'A courier drops a parcel: the lowest free door of exactly its size, and a one-time code',
      requestBody: {
        required: true,
        content: { 'application/json': { example: { sizeClass: 'M', flat: '302' } } },
      },
      responses: {
        201: {
          ...ok('A door was chosen; the code is shown here only', {
            parcelId: 'P017', door: 'D22', sizeClass: 'M', flat: '302', droppedAt: '2026-09-25T13:10:00Z',
            code: '482913', expiresAt: '2026-09-27T13:10:00Z',
          }),
          headers: { Location: { schema: { type: 'string' }, description: '/parcels/P017' } },
        },
        400: refusal(
          'The flat does not exist, or the body fails validation',
          problem(400, '/errors/no-such-flat', 'No such flat', 'There is no flat 999 in this tower', '/drops'),
          problem(
            400, '/errors/validation', 'Invalid request', 'The request is not valid', '/drops',
            { errors: [{ field: 'sizeClass', message: 'Invalid enum value' }] },
          )),
        409: refusal(
          'No free door of that size',
          problem(409, '/errors/no-door-free', 'No door free', 'No L door is free', '/drops', { freeSizes: ['S', 'M'] }),
        ),
      },
    },
  },
};

module.exports = { paths };
