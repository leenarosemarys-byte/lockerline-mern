'use strict';

const { NoSuchCode, CodeExpired, CodeUsed } = require('../errors');
const { codeMatches } = require('../parcels/codes');
const { wholeSecond, iso } = require('../time');

const TOWER = 'A';

function makePickupService({ parcels, doors, settings, clock, inTransaction }) {
  /**
   * The parcel this code belongs to, compared with each stored hash in constant time; null if none. If an old,
   * collected parcel happens to share the code, the parcel still waiting wins.
   */
  async function parcelFor(code, session) {
    const matching = (await parcels.withCodes(TOWER, session))
      .filter((p) => codeMatches(code, p.codeHash, settings.codeHashKey));

    return matching.find((p) => p.state === 'holding')
      || matching[0]
      || null;
  }

  /**
   * A resident keys a code: the door opens once. Marking the parcel collected (with its dwell) and freeing the door
   * are one transaction, so the wall never shows a free door with a parcel still on it.
   */
  async function pickup(code) {
    return inTransaction(
      async (session) => {
        const parcel = await parcelFor(code, session);
        if (!parcel) throw new NoSuchCode();
        if (parcel.codeUsedAt) throw new CodeUsed();

        const openedAt = wholeSecond(clock.now());

        if (openedAt > parcel.codeExpiresAt) throw new CodeExpired();

        const dwellSeconds = Math.floor(
          (openedAt.getTime() - parcel.droppedAt.getTime()) / 1000
        );

        await parcels.collect(
          parcel.parcelId,
          { collectedAt: openedAt, dwellSeconds },
          session
        );

        await doors.release(TOWER, parcel.doorId, session);

        return {
          parcelId: parcel.parcelId,
          door: parcel.doorId,
          openedAt: iso(openedAt),
          dwellSeconds,
        };
      }
    );
  }

  return { pickup };
}

module.exports = { makePickupService };