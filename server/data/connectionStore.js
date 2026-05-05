import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE_PATH = join(__dirname, 'connections.json');

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

function writeAll(connections) {
  writeFileSync(FILE_PATH, JSON.stringify(connections, null, 2), 'utf8');
}

export function findAll() {
  return readAll();
}

export function findByFrom(fromId) {
  return readAll().filter(c => c.fromId === fromId);
}

export function exists(fromId, toId) {
  return readAll().some(c => c.fromId === fromId && c.toId === toId);
}

export function create(fromId, toId) {
  const connections = readAll();
  const connection = {
    id: uuidv4(),
    fromId,
    toId,
    createdAt: new Date().toISOString(),
  };
  connections.push(connection);
  writeAll(connections);
  return connection;
}
