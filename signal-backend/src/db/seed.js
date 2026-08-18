/* Run with: npm run seed
 * Creates a couple of demo staff accounts so you can log in immediately.
 * Safe to re-run — skips accounts that already exist.
 */
const bcrypt = require('bcryptjs');
const staffRepo = require('./staffRepo');

const demoAccounts = [
  { name: 'Dispatcher Demo', email: 'dispatcher@signal.app', password: 'password123', role: 'dispatcher', badgeId: 'D-04' },
  { name: 'Admin Demo', email: 'admin@signal.app', password: 'password123', role: 'admin', badgeId: 'A-01' },
];

for (const acc of demoAccounts) {
  if (staffRepo.findByEmail(acc.email)) {
    console.log(`Skipping ${acc.email} — already exists`);
    continue;
  }
  const passwordHash = bcrypt.hashSync(acc.password, 10);
  staffRepo.create({ name: acc.name, email: acc.email, passwordHash, role: acc.role, badgeId: acc.badgeId });
  console.log(`Created ${acc.role}: ${acc.email} / ${acc.password}`);
}

console.log('Seed complete.');
