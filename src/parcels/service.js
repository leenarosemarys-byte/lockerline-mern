
'use strict';
const { NoSuchParcel } = require('../errors');
const { iso } = require('../time');

/** An event as the API shows it: when, what, and its facts. */
function shapeEvent(e) {
  return { at: iso(e.at), kind: e.kind, ...e.data };
}

function makeParcelService({ repository, events }) {
  /** A parcel and its whole history: the events are the only history the API gives. */
  async function parcel(parcelId) {
    const p = await repository.byId(parcelId);
    if (!p) throw new NoSuchParcel(parcelId);
    return {
      parcelId: p.parcelId, door: p.doorId, sizeClass:p.sizeClass,flat: p.flat,state: p.state,
      droppedAt: iso(p.droppedAt), events: (await events.forParcel(parcelId)).map(shapeEvent),
    };
  }

  return { parcel };
}

module.exports = { makeParcelService };
