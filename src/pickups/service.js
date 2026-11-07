'use strict';

const { NoSuchCode, CodeExpired, PickupNotYetAvailable } = require('../errors');
const { codeMatches } = require('../parcels/codes');

const TOWER = 'A';

function makePickupService({ parcels, settings, clock }) {
  /** The waiting parcel this code opens, compared with each stored hash in constant time; null if none. */
  async function parcelFor(code) {
    const waiting = await parcels.waiting(TOWER);
    return waiting.find((p) => codeMatches(code, p.codeHash, settings.codeHashKey)) || null;
  }

  /** A resident keys a code: refused if it never existed or its window has passed. */
  async function pickup(code) {
    const parcel = await parcelFor(code);
    if (!parcel) throw new NoSuchCode();
    if (clock.now() > parcel.codeExpiresAt) throw new CodeExpired();
    throw new PickupNotYetAvailable();
  }

  return { pickup };
}

module.exports = { makePickupService };
