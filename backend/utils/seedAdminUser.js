import User from '../models/User.js';

// The only way an Admin account comes into existence: bootstrapped from
// server config, never from the public registration form. Safe to call on
// every server start — a no-op once the admin account already exists.
export const seedAdminUser = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.warn('ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin account seed.');
    return;
  }

  const existing = await User.findOne({ email });
  if (existing) return;

  await User.create({
    name: process.env.ADMIN_NAME || 'Admin',
    email,
    password,
    role: 'Admin'
  });

  console.log(`Seeded admin account for ${email}`);
};
