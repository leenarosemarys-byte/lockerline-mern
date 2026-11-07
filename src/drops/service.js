'use strict';
const { NoSuchFlat, NoDoorFree } = require('../errors');
const { wholeSecond, iso } = require('../time');

function makeDropService({ repository, parcels, db, clock }) {
  async function drop({ sizeClass, flat }) {
    return db.inTransaction(async (session) => {
      if (!(await repository.residentExists('A', flat, session))) {
        throw new NoSuchFlat(flat);
      }

      const door = await repository.lowestFree('A', sizeClass, session);

      if (!door) {
        const freeSizes = await repository.freeSizes('A', session);
        throw new NoDoorFree(sizeClass, freeSizes);
      }

      const parcelId = await parcels.nextId(session);
      const droppedAt = wholeSecond(clock.now());

      await parcels.insert({
        parcelId,
        towerId: 'A',
        flat,
        sizeClass,
        doorId: door.no,
        droppedAt,
        collectedAt: null,
        state: 'holding',
      }, session);

      await repository.hold('A', door.no, parcelId, session);

      return {
        parcelId,
        door: door.no,
        sizeClass,
        flat,
        droppedAt: iso(droppedAt),
        state: 'holding',
      };
    });
  }

  return { drop };
}

module.exports = { makeDropService };
