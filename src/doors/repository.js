'use strict';

const mongoose = require('mongoose');

const Tower = mongoose.model('Tower', new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  name: { type: String, required: true },
}, { collection: 'towers' }));

const doorSchema = new mongoose.Schema({
  towerId: { type: String, required: true },
  no: { type: String, required: true },
  sizeClass: { type: String, enum: ['S', 'M', 'L'], required: true },
  currentParcelId: { type: String, default: null },
}, { collection: 'doors' });

doorSchema.index({ towerId: 1, no: 1 }, { unique: true });
const Door = mongoose.model('Door', doorSchema);

const residentSchema = new mongoose.Schema({
  towerId: { type: String, required: true },
  flat: { type: String, required: true },
  name: { type: String, required: true },
}, { collection: 'residents' });

residentSchema.index({ towerId: 1, flat: 1 }, { unique: true });
const Resident = mongoose.model('Resident', residentSchema);

function towerExists(code) {
  return Tower.exists({ code });
}

async function addTower({ code, name, doors, residents }) {
  await Tower.create({ code, name });
  await Door.insertMany(
    doors.map((d) => ({
      towerId: code,
      no: d.no,
      sizeClass: d.sizeClass,
    }))
  );
  await Resident.insertMany(
    residents.map((r) => ({
      towerId: code,
      flat: r.flat,
      name: r.name,
    }))
  );
}

/** A tower's doors in door-number order, as plain objects. */
function doorsOf(towerId) {
  return Door.find({ towerId }).sort({ no: 1 }).lean();
}

function door(towerId, no) {
  return Door.findOne({ towerId, no }).lean();
}

function residentExists(towerId, flat, session) {
  const query = Resident.exists({ towerId, flat });
  if (session) query.session(session);
  return query;
}

/** The free door of exactly this size with the lowest number, or null. */
function lowestFree(towerId, sizeClass, session) {
  return Door.findOne({
    towerId,
    sizeClass,
    currentParcelId: null,
  }).sort({ no: 1 }).session(session).lean();
}

/** The size classes that still have at least one free door, small to large. */
async function freeSizes(towerId, session) {
  const sizes = await Door.distinct(
    'sizeClass',
    { towerId, currentParcelId: null }
  ).session(session);

  return ['S', 'M', 'L'].filter((size) => sizes.includes(size));
}

async function hold(towerId, no, parcelId, session) {
  await Door.updateOne(
    { towerId, no },
    { $set: { currentParcelId: parcelId } },
    { session }
  );
}

async function release(towerId, no, session) {
  await Door.updateOne(
    { towerId, no },
    { $set: { currentParcelId: null } },
    { session }
  );
}

module.exports = {
  towerExists,
  addTower,
  doorsOf,
  door,
  residentExists,
  lowestFree,
  freeSizes,
  hold,
  release,
};