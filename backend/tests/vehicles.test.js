import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';
import jwt from 'jsonwebtoken';

let mongoServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Vehicle.deleteMany({});
  await User.deleteMany({});
  
  await Vehicle.insertMany([
    {
      vehicleId: 'CAR001',
      make: 'BMW',
      model: 'M4 Competition',
      year: 2024,
      price: 8995000,
      currency: 'INR',
      category: 'Sports Coupe',
      fuelType: 'Petrol',
      stock: 5,
    },
    {
      vehicleId: 'CAR002',
      make: 'Mercedes-Benz',
      model: 'C300',
      year: 2023,
      price: 4795000,
      currency: 'INR',
      category: 'Sedan',
      fuelType: 'Petrol',
      stock: 0,
    }
  ]);
});

describe('Vehicle API Endpoints', () => {
  it('GET /api/vehicles should return 401 if not authorized', async () => {
    const res = await request(app).get('/api/vehicles');
    expect(res.statusCode).toEqual(401);
  });

  it('GET /api/vehicles should return all vehicles for an authenticated user', async () => {
    // Create a dummy user
    const user = await User.create({
      email: 'testauth@example.com',
      password: 'password123',
      role: 'User'
    });
    
    // Generate token for the dummy user
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'test_secret_key', {
      expiresIn: '30d',
    });

    const res = await request(app)
      .get('/api/vehicles')
      .set('Authorization', `Bearer ${token}`);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.data.length).toBe(2);
    const makes = res.body.data.map(v => v.make);
    expect(makes).toContain('BMW');
  });
});
