'use strict';
const fs = require('fs');
const path = require('path');
const doors = require('./doors/repository');

const TOWER = 'A';

/** The rows of a seed CSV as objects keyed by its header (the files hold plain comma-separated values). */
function readCsv(file) {
  const [header, ...rows] = fs.readFileSync(file, 'utf8').split(/\r?\n/).filter((line) => line.trim());
  const keys = header.split(',').map((k) => k.trim());
  return rows.map((row) => {
    const cells = row.split(',').map((c) => c.trim());
    return Object.fromEntries(keys.map((k, i) => [k, cells[i]]));
  });
}

/** Loads tower A, its doors and its residents - once. A second start finds the tower and adds nothing. */
async function seed({ settings }) {
  await doors.ready();
  if (await doors.towerExists(TOWER)) return;
  await doors.addTower({
    code: TOWER,
    name: 'Tower A',
    doors: readCsv(path.join(settings.seedDir, 'doors.csv')).map((r) => ({ no: r.no, sizeClass: r.size_class })),
    residents: readCsv(path.join(settings.seedDir, 'residents.csv')),
  });
}

module.exports = { seed };
