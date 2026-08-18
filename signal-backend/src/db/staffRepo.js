const crypto = require('crypto');
const store = require('./jsonStore');

const TABLE = 'staff';

function all() {
  return store.read(TABLE);
}

function findByEmail(email) {
  return all().find(s => s.email.toLowerCase() === String(email).toLowerCase());
}

function findById(id) {
  return all().find(s => s.id === id);
}

function create({ name, email, passwordHash, role, badgeId }) {
  const staff = all();
  if (findByEmail(email)) {
    const err = new Error('A staff account with this email already exists');
    err.status = 409;
    throw err;
  }
  const record = {
    id: crypto.randomUUID(),
    name,
    email: email.toLowerCase(),
    passwordHash,
    role,               // 'dispatcher' | 'admin' | 'field_unit'
    badgeId: badgeId || null,
    active: true,
    createdAt: new Date().toISOString(),
  };
  staff.push(record);
  store.write(TABLE, staff);
  return record;
}

function toPublic(staff) {
  if (!staff) return null;
  const { passwordHash, ...safe } = staff;
  return safe;
}

module.exports = { all, findByEmail, findById, create, toPublic };
