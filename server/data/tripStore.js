import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE_PATH = join(__dirname, 'trips.json');

function readAll() {
  if (!existsSync(FILE_PATH)) {
    writeFileSync(FILE_PATH, '[]', 'utf8');
    return [];
  }
  try {
    return JSON.parse(readFileSync(FILE_PATH, 'utf8'));
  } catch {
    return [];
  }
}

function writeAll(trips) {
  writeFileSync(FILE_PATH, JSON.stringify(trips, null, 2), 'utf8');
}

export function findAll() {
  return readAll();
}

export function findById(id) {
  return readAll().find(t => t.id === id) || null;
}

export function findByCreator(creatorId) {
  return readAll().filter(t => t.creatorId === creatorId);
}

export function create(tripData) {
  const trips = readAll();
  const trip = {
    ...tripData,
    createdAt: new Date().toISOString(),
  };
  trips.push(trip);
  writeAll(trips);
  return trip;
}

export function update(id, changes) {
  const trips = readAll();
  const idx = trips.findIndex(t => t.id === id);
  if (idx === -1) throw new Error(`Trip ${id} not found`);
  trips[idx] = { ...trips[idx], ...changes };
  writeAll(trips);
  return trips[idx];
}

export function remove(id) {
  const trips = readAll();
  writeAll(trips.filter(t => t.id !== id));
}
