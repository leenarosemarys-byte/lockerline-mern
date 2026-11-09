'use strict';

const { refusal, problem, ok, pathParam } = require('../docs');

const tower = pathParam('tower', 'The tower code, e.g. A');
const noSuchTower = problem(404, '/errors/no-such-tower', 'No such tower', 'There is no tower Z', '/towers/Z/doors');

const paths = {
  '/towers/{tower}/doors': {
    get: {
      tags: ['doors'],
      summary: 'The wall: every door with its size and state, optionally filtered',
      parameters: [
        tower,
        { name: 'size', in: 'query', schema: { type: 'string', enum: ['S', 'M', 'L'] } },
        { name: 'state', in: 'query', schema: { type: 'string', enum: ['free', 'holding'] } },
      ],
      responses: {
        200: ok('The wall (possibly an empty list)', {
          tower: 'A', free: 47, doors: [{ no: 'D01', size: 'S', state: 'free' },
            { no: 'D21', size: 'M', state: 'holding', parcelId: 'P004', dwellSeconds: 12600 }],
        }),
        400: refusal('An unknown size or state', problem(
          400, '/errors/validation', 'Invalid request',
          'The request is not valid', '/towers/A/doors',
          { errors: [{ field: 'size', message: 'Invalid enum value' }] },
        )),
        404: refusal('An unknown tower', noSuchTower),
      },
    },
  },
  '/towers/{tower}/doors/{no}': {
    get: {
      tags: ['doors'],
      summary: 'One door: a holding door also names its parcel, flat and dwell',
      parameters: [tower, pathParam('no', 'The door number, e.g. D21')],
      responses: {
        200: ok('The door', { no: 'D21', size: 'M', state: 'holding', parcelId: 'P004', flat: '302', dwellSeconds: 12600 }),
        404: refusal(
          'No such door in this tower, or no such tower',
          problem(404, '/errors/no-such-door', 'No such door', 'Tower A has no door D99', '/towers/A/doors/D99'),
          noSuchTower,
        ),
      },
    },
  },
};

module.exports = { paths };
