require('dotenv').config();

function required(name, fallback) {
  const val = process.env[name] ?? fallback;
  if (val === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return val;
}

module.exports = {
  port: parseInt(process.env.PORT || '4000', 10),
  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  corsOrigins: (process.env.CORS_ORIGIN || '').split(',').map(s => s.trim()).filter(Boolean),
  staffRegistrationKey: required('STAFF_REGISTRATION_KEY'),
};
