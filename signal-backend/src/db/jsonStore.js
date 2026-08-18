/**
 * Minimal file-backed JSON datastore.
 *
 * This exists so the "foundation" API has zero external services to stand up —
 * clone, npm install, npm run seed, npm start and it works. It is NOT meant to
 * survive concurrent writers or serious load. When you're ready for a real
 * database, swap this module for a Postgres/Mongo repository behind the same
 * get()/write() shape and nothing in routes/controllers needs to change.
 */
const fs = require('fs');
const path = require('path');

// Defaults to ./data next to the project. In production, set DATA_DIR to a
// mounted persistent disk path (see README > Deploying) — most hosting
// platforms wipe the local filesystem on every deploy/restart otherwise.
const DATA_DIR = process.env.DATA_DIR
  ? path.resolve(process.env.DATA_DIR)
  : path.join(__dirname, '..', '..', 'data');

function filePath(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function ensureFile(name, defaultValue) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const fp = filePath(name);
  if (!fs.existsSync(fp)) {
    fs.writeFileSync(fp, JSON.stringify(defaultValue, null, 2));
  }
}

function read(name) {
  ensureFile(name, []);
  const raw = fs.readFileSync(filePath(name), 'utf-8');
  try {
    return JSON.parse(raw);
  } catch (e) {
    throw new Error(`Corrupt data file: ${name}.json (${e.message})`);
  }
}

function write(name, data) {
  ensureFile(name, []);
  fs.writeFileSync(filePath(name), JSON.stringify(data, null, 2));
}

module.exports = { read, write };
