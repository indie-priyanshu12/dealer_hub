import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../models/User.js';
import { seedAdminUser } from '../utils/seedAdminUser.js';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 600000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany();
  }
  delete process.env.ADMIN_EMAIL;
  delete process.env.ADMIN_PASSWORD;
  delete process.env.ADMIN_NAME;
});

describe('seedAdminUser', () => {
  it('does nothing when ADMIN_EMAIL or ADMIN_PASSWORD is not set', async () => {
    await seedAdminUser();

    const count = await User.countDocuments();
    expect(count).toBe(0);
  });

  it('creates an Admin user from env vars when none exists yet', async () => {
    process.env.ADMIN_EMAIL = 'admin@dealerhub.test';
    process.env.ADMIN_PASSWORD = 'supersecret123';

    await seedAdminUser();

    const admin = await User.findOne({ email: 'admin@dealerhub.test' });
    expect(admin).not.toBeNull();
    expect(admin.role).toBe('Admin');
    expect(admin.name).toBe('Admin');
    expect(await admin.comparePassword('supersecret123')).toBe(true);
  });

  it('uses ADMIN_NAME when provided instead of the default', async () => {
    process.env.ADMIN_EMAIL = 'admin@dealerhub.test';
    process.env.ADMIN_PASSWORD = 'supersecret123';
    process.env.ADMIN_NAME = 'Dealer Hub Admin';

    await seedAdminUser();

    const admin = await User.findOne({ email: 'admin@dealerhub.test' });
    expect(admin.name).toBe('Dealer Hub Admin');
  });

  it('does not create a duplicate on repeated calls', async () => {
    process.env.ADMIN_EMAIL = 'admin@dealerhub.test';
    process.env.ADMIN_PASSWORD = 'supersecret123';

    await seedAdminUser();
    await seedAdminUser();

    const count = await User.countDocuments({ email: 'admin@dealerhub.test' });
    expect(count).toBe(1);
  });
});
