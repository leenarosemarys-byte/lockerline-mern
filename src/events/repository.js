'use strict';
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  towerId: { type: String, required: true },
  parcelId: { type: String, required: true },
  kind: {
    type: String, required: true,
    enum: ['dropped', 'code_issued', 'opened', 'swept', 'rehomed', 'charged', 'notified'],
  },
  at: { type: Date, required: true },
  data: { type: Object, default: {} },
}, { collection: 'events' });

/** The log is append-only: any attempt to change or remove an event is refused here, whoever makes it. */
function refuse() {
  throw new Error('events are append-only: an event is never changed or deleted');
}
const CHANGES = [
  'updateOne', 'updateMany', 'replaceOne', 'findOneAndUpdate', 'findOneAndReplace', 'deleteOne',
  'deleteMany', 'findOneAndDelete'
];

eventSchema.pre(CHANGES, { document: false, query: true }, refuse);
eventSchema.pre(['updateOne', 'deleteOne'], { document: true, query: false }, refuse);
eventSchema.pre('save', function refuseRewrite() {
  if (!this.isNew) refuse();
});

const Event = mongoose.model('Event', eventSchema);

/** Writes one event, inside the transaction of the change it records. */
async function record({ towerId, parcelId, kind, at, data }, session) {
  await Event.create([{ towerId, parcelId, kind, at, data }], { session });
}

/** A parcel's events, oldest first (same-time events in the order they were written). */
function forParcel(parcelId) {
  return Event.find({ parcelId }).sort({ at: 1, _id: 1 }).lean();
}

module.exports = { record, forParcel };