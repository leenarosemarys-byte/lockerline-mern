
'use strict';

const { NoSuchFlat, NoDoorFree } = require('../errors');
const { wholeSecond, iso } = require('../time');
const { newCode, hashCode } = require('../parcels/codes');

const TOWER = 'A';
const HOUR = 60 * 60 * 1000;

function makeDropService({ doors, parcels, events, settings, clock, inTransaction }) {
  /** A code no parcel still waiting in a door has (one chance in a million of a clash, so draw again if so). */
  async function freshCode(session) {
    let code = newCode();

    while (
      await parcels.codeHashWaiting(
        hashCode(code, settings.codeHashKey),
        session
      )
    ) {
      code = newCode();
    }

    return code;
  }

  /**
   * A courier's drop: the free door of exactly this size with the lowest number. Recording the parcel, holding the
   * door and writing their events happen in one transaction, so a failure part-way leaves none of them.
   */
  async function drop({ sizeClass, flat }) {
    return inTransaction(async (session) => {
      if (!(await doors.residentExists(TOWER, flat, session))) {
        throw new NoSuchFlat(flat);
      }

      const door = await doors.lowestFree(TOWER, sizeClass, session);

      if (!door) {
        const freeSizes = await doors.freeSizes(TOWER, session);
        throw new NoDoorFree(sizeClass, freeSizes);
      }

      const droppedAt = wholeSecond(clock.now());

      const expiresAt = new Date(
        droppedAt.getTime() + settings.freeWindowHours * HOUR
      );

      const parcelId = await parcels.nextId(session);

      const code = await freshCode(session);

      await parcels.insert({
        parcelId,
        towerId: TOWER,
        flat,
        sizeClass,
        doorId: door.no,
        droppedAt,
        codeHash: hashCode(code, settings.codeHashKey),
        codeExpiresAt: expiresAt,
        state: 'holding',
      }, session);

      await doors.hold(TOWER, door.no, parcelId, session);

      await events.record({ towerId: TOWER, parcelId, kind: 'dropped', at: droppedAt, data: { door: door.no } }, session);
      await events.record(
        {
          towerId: TOWER, parcelId, kind: 'code_issued', at: droppedAt, data: { expiresAt: iso(expiresAt) },
        }, session,
      );

      // The only answer that ever shows the code: the courier hands it to the resident.
      return {
        parcelId,
        door: door.no,
        sizeClass,
        flat,
        droppedAt: iso(droppedAt),
        code,
        expiresAt: iso(expiresAt),
        state: 'holding',
      };
    });
  }

  return { drop };
}

module.exports = { makeDropService };
