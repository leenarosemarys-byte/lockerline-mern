'use strict';

const mongoose = require('mongoose');

const parcelSchema = new mongoose.Schema({
  parcelId: { type: String, required: true, unique: true },
  towerId: { type: String, required: true },
  flat: { type: String, required: true },
  sizeClass: { type: String, enum: ['S', 'M', 'L'], required: true },
  doorId: { type: String, required: true },
  droppedAt: { type: Date, required: true },
  codeHash: { type: String, required: true },
  codeExpiresAt: { type: Date, required: true },
  codeUsedAt: { type: Date, default: null },
  collectedAt: { type: Date, default: null },
  dwellSeconds: { type: Number, default: null },
  state: { type: String, enum: ['holding', 'collected'], required: true },
}, { collection: 'parcels' });

const Parcel = mongoose.model('Parcel', parcelSchema);

async function nextId(session) {
  const last = await Parcel.findOne()
    .sort({ parcelId: -1 })
    .session(session)
    .lean();

  const nextNumber = last
    ? Number(last.parcelId.replace(/\D/g, '')) + 1
    : 1;

  return `P${String(nextNumber).padStart(4, '0')}`;
}

function insert(data, session) {
  return Parcel.create([data], { session });
}

function byId(parcelId) {
  return Parcel.findOne({ parcelId }).lean();
}

/** Whether a parcel still waiting in its door already has this code hash (two waiting codes must differ). */
function codeHashWaiting(codeHash, session) {
  return Parcel.exists({ codeHash, state: 'holding' }).session(session);
}

/** Every parcel of a tower with its code hash (waiting or collected: a used code must still be recognised). */
function withCodes(towerId, session) {
  return Parcel.find({ towerId }).session(session).lean();
}

/** The parcel is collected: its code is used up and its dwell is stored, never recomputed on read. */
async function collect(parcelId, { collectedAt, dwellSeconds }, session) {
  await Parcel.updateOne(
    { parcelId },
    { $set: { state: 'collected', collectedAt, dwellSeconds, codeUsedAt: collectedAt } },
    { session }
  );
}

function byIds(parcelIds) {
  return Parcel.find({ parcelId: { $in: parcelIds } }).lean();
}

module.exports = {
  nextId,
  insert,
  byId,
  codeHashWaiting,
  withCodes,
  collect,
  byIds,
};