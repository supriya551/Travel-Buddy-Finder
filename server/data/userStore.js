import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE_PATH = join(__dirname, 'users.json');

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

function writeAll(users) {
  writeFileSync(FILE_PATH, JSON.stringify(users, null, 2), 'utf8');
}

export function findAll() {
  return readAll();
}

export function findByEmail(email) {
  return readAll().find(u => u.email === email.toLowerCase()) || null;
}

export function findById(id) {
  return readAll().find(u => u.id === id) || null;
}

export function create(userData) {
  const users = readAll();
  const user = {
    ...userData,
    email: userData.email.toLowerCase(),
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  writeAll(users);
  return user;
}

export function update(id, changes) {
  const users = readAll();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) throw new Error(`User ${id} not found`);
  users[idx] = { ...users[idx], ...changes };
  writeAll(users);
  return users[idx];
}

export function remove(id) {
  const users = readAll();
  writeAll(users.filter(u => u.id !== id));
}
