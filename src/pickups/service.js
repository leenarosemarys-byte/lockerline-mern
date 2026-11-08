
'use strict';

const { NoSuchCode, CodeExpired, CodeUsed } = require('../errors');
const { wholeSecond, iso } = require('../time');
const { hashCode } = require('../parcels/codes');

const TOWER = 'A';

function makePickupService({ parcels, doors, events, settings, clock, inTransaction }) {
  /**
   * A resident keys a code: the door opens once. Marking the parcel collected (with its dwell), freeing the door and
   * writing the event are one transaction, so the wall never shows a free door with a parcel still on it.
   */
  async function pickup(code) {
    return inTransaction(async (session) => {
      const codeHash = hashCode(code, settings.codeHashKey);
      const matches = await parcels.withCodes(TOWER, codeHash, session);

      if (!matches.length) {
        throw new NoSuchCode();
      }

      const parcel = matches.find((item) => item.state === 'holding') || matches[0];

      if (parcel.codeUsedAt) {
        throw new CodeUsed();
      }

      const now = wholeSecond(clock.now());

      if (now > parcel.codeExpiresAt) {
        throw new CodeExpired();
      }

      const openedAt = now;
      const dwellSeconds = Math.max(
        0,
        Math.floor((openedAt.getTime() - parcel.droppedAt.getTime()) / 1000)
      );

      await parcels.collect(parcel.parcelId, {
        collectedAt: openedAt,
        dwellSeconds,
      }, session);

      await doors.release(TOWER, parcel.doorId, session);

      await events.record(
        {
          towerId: TOWER,
          parcelId: parcel.parcelId,
          kind: 'opened',
          at: openedAt,
          data: { door: parcel.doorId, dwellSeconds },
        },
        session,
      );

      return {
        parcelId: parcel.parcelId,
        door: parcel.doorId,
        openedAt: iso(openedAt),
        dwellSeconds,
      };
    });
  }

  return { pickup };
}

module.exports = { makePickupService };
