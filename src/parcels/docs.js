
'use strict';

const { refusal, problem, ok, pathParam } = require('../docs');

const paths = {
  '/parcels/{parcelId}': {
    get: {
      tags: ['parcels'],
      summary: 'One parcel and its events, oldest first',
      parameters: [pathParam('parcelId', 'The parcel id, e.g. P017')],
      responses: {
        200: ok('The parcel', {
          parcelId: 'P017', state: 'collected', door: 'D22', sizeClass: 'M', flat: '302',
          droppedAt: '2026-09-25T13:10:00Z',
          events: [
            { at: '2026-09-25T13:10:00Z', kind: 'dropped', door: 'D22' },
            { at: '2026-09-25T13:10:00Z', kind: 'code_issued', expiresAt: '2026-09-27T13:10:00Z' },
            { at: '2026-09-27T09:12:00Z', kind: 'opened', door: 'D22', dwellSeconds: 158520 },
          ],
        }),
        404: refusal(
          'No such parcel',
          problem(404, '/errors/no-such-parcel', 'No such parcel', 'There is no parcel P999', '/parcels/P999')),
      },
    },
  },
};

module.exports = { paths };
