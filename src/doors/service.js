'use strict';

function makeDoorService({ repository, parcels, clock }) {
  async function requireTower(towerId) {
    if (!(await repository.towerExists(towerId))) {
      throw new Error('No such tower');
    }
  }

  /** Whole seconds a parcel has waited, up to now. */
  function dwellSeconds(parcel) {
    return Math.floor(
      (clock.now().getTime() - parcel.droppedAt.getTime()) / 1000
    );
  }

  /** A free door has no parcel details; a holding door includes its parcel and dwell time. */
  function shape(doorDoc, parcel) {
    const shaped = {
      no: doorDoc.no,
      size: doorDoc.sizeClass,
      state: stateOf(doorDoc),
    };

    return parcel
      ? {
          ...shaped,
          parcelId: parcel.parcelId,
          dwellSeconds: dwellSeconds(parcel),
        }
      : shaped;
  }

  async function wall(towerId, filters = {}) {
    await requireTower(towerId);

    const all = await repository.doorsOf(towerId);

    const held = await parcels.byIds(
      all
        .filter((d) => d.currentParcelId !== null)
        .map((d) => d.currentParcelId)
    );

    const byId = new Map(held.map((p) => [p.parcelId, p]));

    const doors = all
      .map((d) => shape(d, byId.get(d.currentParcelId)))
      .filter((d) => !filters.size || d.size === filters.size)
      .filter((d) => !filters.state || d.state === filters.state);

    return {
      doors,
      free: doors.filter((d) => d.state === 'free').length,
    };
  }

  /** One door; a holding door read alone also names the flat its parcel is for. */
  async function door(towerId, no) {
    await requireTower(towerId);

    const found = await repository.door(towerId, no);

    if (!found) throw new Error('No such door');

    if (found.currentParcelId === null) return shape(found);

    const parcel = await parcels.byId(found.currentParcelId);
    const { dwellSeconds: dwell, ...rest } = shape(found, parcel);

    return {
      ...rest,
      flat: parcel.flat,
      dwellSeconds: dwell,
    };
  }

  return { wall, door };
}

function stateOf(doorDoc) {
  return doorDoc.currentParcelId ? 'holding' : 'free';
}

module.exports = { makeDoorService };
