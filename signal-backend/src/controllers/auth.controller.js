const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../config');
const staffRepo = require('../db/staffRepo');

const VALID_ROLES = ['dispatcher', 'admin', 'field_unit'];

function signToken(staff) {
  return jwt.sign(
    { sub: staff.id, role: staff.role, name: staff.name, email: staff.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

function register(req, res, next) {
  try {
    const { name, email, password, role, badgeId, registrationKey } = req.body;

    if (registrationKey !== config.staffRegistrationKey) {
      return res.status(403).json({ error: 'Invalid staff registration key' });
    }
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'name, email and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }
    const finalRole = VALID_ROLES.includes(role) ? role : 'dispatcher';

    const passwordHash = bcrypt.hashSync(password, 10);
    const staff = staffRepo.create({ name, email, passwordHash, role: finalRole, badgeId });

    const token = signToken(staff);
    res.status(201).json({ token, staff: staffRepo.toPublic(staff) });
  } catch (e) {
    next(e);
  }
}

function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required' });
    }

    const staff = staffRepo.findByEmail(email);
    if (!staff || !staff.active) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = bcrypt.compareSync(password, staff.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = signToken(staff);
    res.json({ token, staff: staffRepo.toPublic(staff) });
  } catch (e) {
    next(e);
  }
}

function me(req, res, next) {
  try {
    const staff = staffRepo.findById(req.staff.id);
    if (!staff) return res.status(404).json({ error: 'Staff not found' });
    res.json({ staff: staffRepo.toPublic(staff) });
  } catch (e) {
    next(e);
  }
}

module.exports = { register, login, me };
