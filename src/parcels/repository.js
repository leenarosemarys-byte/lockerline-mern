'use strict';
const mongoose = require('mongoose');

const Parcel = mongoose.model('Parcel', new mongoose.Schema({
  parcelId: { type: String, required: true, unique: true },
  towerId: { type: String, required: true },
  flat: { type: String, required: true },
  sizeClass: { type: String, enum: ['S', 'M', 'L'], required: true },
  doorId: { type: String, required: true },
  droppedAt: { type: Date, required: true },
  collectedAt: { type: Date, default: null },
  state: { type: String, enum: ['holding', 'collected'], default: 'holding' },
}, { collection: 'parcels' }));

/** The next parcel id, P001 first: 'P' and a three-digit running number, taken inside the drop's transaction. */
async function nextId(session) {
  const count = await Parcel.countDocuments({}, { session });
  return `P${String(count + 1).padStart(3, '0')}`;
}

async function insert(parcel, session) {
  await Parcel.create([parcel], { session });
}

function byId(parcelId) {
  return Parcel.findOne({ parcelId }).lean();
}

function byIds(parcelIds) {
  return Parcel.find({ parcelId: { $in: parcelIds } }).lean();
}

module.exports = { nextId, insert, byId, byIds };
