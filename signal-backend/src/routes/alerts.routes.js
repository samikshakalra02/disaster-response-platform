const express = require('express');
const {
  createAlert,
  listAlerts,
  getAlert,
  updateAlertStatus,
} = require('../controllers/alerts.controller');
const { verifyToken, requireRole } = require('../middleware/auth');

const router = express.Router();

// Public: citizen app submits an SOS/report — no auth required.
router.post('/', createAlert);

// Staff-only from here down.
router.get('/', verifyToken, requireRole('dispatcher', 'admin'), listAlerts);
router.get('/:id', verifyToken, requireRole('dispatcher', 'admin'), getAlert);
router.patch('/:id/status', verifyToken, requireRole('dispatcher', 'admin'), updateAlertStatus);

module.exports = router;
