import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from '../models/User.js';

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
});

describe('User Model Test', () => {
  it('should validate required fields (name, email, password)', async () => {
    const user = new User({});

    let error;
    try {
      await user.validate();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.errors.name).toBeDefined();
    expect(error.errors.name.message).toBe('Name is required');
    expect(error.errors.email).toBeDefined();
    expect(error.errors.email.message).toBe('Email is required');
    expect(error.errors.password).toBeDefined();
    expect(error.errors.password.message).toBe('Password is required');
  });

  it('should reject duplicate emails', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };

    const user1 = new User(userData);
    await user1.save();

    const user2 = new User(userData);
    
    let error;
    try {
      await user2.save();
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.code).toBe(11000); // MongoDB duplicate key error code
  });

  it('should create a user successfully with valid inputs', async () => {
    const validUser = new User({
      name: 'Valid User',
      email: 'valid@example.com',
      password: 'securepassword'
    });

    const savedUser = await validUser.save();

    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe('Valid User');
    expect(savedUser.email).toBe('valid@example.com');
    expect(savedUser.password).not.toBe('securepassword');
    expect(savedUser.password.startsWith('$2b$')).toBe(true); // bcrypt signature
    expect(savedUser.role).toBe('User'); // Checking default role
  });
});
