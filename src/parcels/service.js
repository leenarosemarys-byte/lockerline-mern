'use strict';
const { NoSuchParcel } = require('../errors');
const { iso } = require('../time');

function makeParcelService({ repository }) {
  async function parcel(parcelId) {
    const p = await repository.byId(parcelId);
    if (!p) throw new NoSuchParcel(parcelId);
    return {
      parcelId: p.parcelId, door: p.doorId, sizeClass:p.sizeClass,flat: p.flat,state: p.state,
      droppedAt: iso(p.droppedAt),
    };
  }

  return { parcel };
}

module.exports = { makeParcelService };
