'use strict';
const { NoSuchTower, NoSuchDoor } = require('../errors');

/** A door's state is derived from what it holds, on every read; nothing stores it. */
function stateOf(door) {
  return door.currentParcelId === null ? 'free' : 'holding';
}

function makeDoorService({ repository }) {
  async function requireTower(tower) {
    if (!(await repository.towerExists(tower))) throw new NoSuchTower(tower);
  }

  /** The wall, optionally only one size and/or one state; `free` counts the free doors among those shown. */
  async function wall(tower, { size, state } = {}) {
    await requireTower(tower);
    const doors = (await repository.doorsOf(tower))
      .map((d) => ({ no: d.no, size: d.sizeClass, state: stateOf(d) }))
      .filter((d) => (!size || d.size === size) && (!state || d.state === state));
    return { tower, free: doors.filter((d) => d.state === 'free').length, doors };
  }

  async function door(tower, no) {
    await requireTower(tower);
    const found = await repository.door(tower, no);
    if (!found) throw new NoSuchDoor(tower, no);
    return { no: found.no, size: found.sizeClass, state: stateOf(found) };
  }

  return { wall, door };
}

module.exports = { makeDoorService };
