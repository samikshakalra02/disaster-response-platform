const crypto = require('crypto');
const store = require('./jsonStore');

const TABLE = 'alerts';
const STATUS_FLOW = ['new', 'ack', 'dispatched', 'resolved'];

const CRITICAL_TYPES = new Set(['Fire', 'Medical', 'Assault', 'Gas Leak']);

function computePriority(type) {
  return CRITICAL_TYPES.has(type) ? 1 : 2;
}

function all() {
  return store.read(TABLE);
}

function findById(id) {
  return all().find(a => a.id === id);
}

function create({ type, name, phone, count, description, location }) {
  const alerts = all();
  const now = new Date().toISOString();
  const record = {
    id: crypto.randomUUID(),
    type: type || 'Unspecified Emergency',
    priority: computePriority(type),
    status: 'new',
    reporter: {
      name: name || null,
      phone: phone || null,
    },
    peopleAffected: count ? Number(count) : null,
    description: description || '',
    location: location || null, // { lat, lng, address? }
    timeline: [{ status: 'new', at: now }],
    createdAt: now,
    updatedAt: now,
  };
  alerts.unshift(record);
  store.write(TABLE, alerts);
  return record;
}

function updateStatus(id, nextStatus) {
  const alerts = all();
  const idx = alerts.findIndex(a => a.id === id);
  if (idx === -1) {
    const err = new Error('Alert not found');
    err.status = 404;
    throw err;
  }
  if (!STATUS_FLOW.includes(nextStatus)) {
    const err = new Error(`Invalid status. Must be one of: ${STATUS_FLOW.join(', ')}`);
    err.status = 400;
    throw err;
  }
  const current = alerts[idx];
  const currentIdx = STATUS_FLOW.indexOf(current.status);
  const nextIdx = STATUS_FLOW.indexOf(nextStatus);
  if (nextIdx < currentIdx) {
    const err = new Error(`Cannot move status backwards (${current.status} -> ${nextStatus})`);
    err.status = 400;
    throw err;
  }
  current.status = nextStatus;
  current.updatedAt = new Date().toISOString();
  current.timeline.push({ status: nextStatus, at: current.updatedAt });
  alerts[idx] = current;
  store.write(TABLE, alerts);
  return current;
}

module.exports = { all, findById, create, updateStatus, STATUS_FLOW };
