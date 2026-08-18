const alertsRepo = require('../db/alertsRepo');

// Public — called by the citizen app when an SOS/report is submitted. No auth:
// someone in an emergency should never be blocked by a login screen.
function createAlert(req, res, next) {
  try {
    const { type, name, phone, count, description, location } = req.body;
    const alert = alertsRepo.create({ type, name, phone, count, description, location });
    res.status(201).json({ alert });
  } catch (e) {
    next(e);
  }
}

// Staff-only — dispatch queue.
function listAlerts(req, res, next) {
  try {
    let alerts = alertsRepo.all();
    const { status, priority } = req.query;
    if (status) alerts = alerts.filter(a => a.status === status);
    if (priority) alerts = alerts.filter(a => a.priority === Number(priority));

    alerts.sort((a, b) =>
      (a.status === 'resolved') - (b.status === 'resolved') ||
      a.priority - b.priority ||
      new Date(b.createdAt) - new Date(a.createdAt)
    );
    res.json({ alerts });
  } catch (e) {
    next(e);
  }
}

function getAlert(req, res, next) {
  try {
    const alert = alertsRepo.findById(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    res.json({ alert });
  } catch (e) {
    next(e);
  }
}

function updateAlertStatus(req, res, next) {
  try {
    const { status } = req.body;
    const alert = alertsRepo.updateStatus(req.params.id, status);
    res.json({ alert });
  } catch (e) {
    next(e);
  }
}

module.exports = { createAlert, listAlerts, getAlert, updateAlertStatus };
