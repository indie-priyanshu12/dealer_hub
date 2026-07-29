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

describe('POST /api/vehicles', () => {
  const newVehicle = {
    vehicleId: 'CAR003',
    make: 'Audi',
    model: 'A4',
    year: 2024,
    price: 4500000,
    category: 'Sedan',
    fuelType: 'Petrol',
    stock: 3,
  };

  const getAuthToken = async () => {
    const user = await User.create({
      email: 'creator@example.com',
      password: 'password123',
      role: 'User',
    });
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'test_secret_key', {
      expiresIn: '30d',
    });
  };

  it('should return 401 if not authorized', async () => {
    const res = await request(app).post('/api/vehicles').send(newVehicle);
    expect(res.statusCode).toEqual(401);
  });

  it('should create a new vehicle for an authenticated user', async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send(newVehicle);

    expect(res.statusCode).toEqual(201);
    expect(res.body.success).toBeTruthy();
    expect(res.body.data.vehicleId).toBe('CAR003');
    expect(res.body.data.make).toBe('Audi');

    const inDb = await Vehicle.findOne({ vehicleId: 'CAR003' });
    expect(inDb).not.toBeNull();
    expect(inDb.stock).toBe(3);
  });

  it('should reject a vehicle missing required fields', async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({ make: 'Audi' });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBeFalsy();
  });

  it('should reject a duplicate vehicleId', async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .post('/api/vehicles')
      .set('Authorization', `Bearer ${token}`)
      .send({ ...newVehicle, vehicleId: 'CAR001' }); // seeded in beforeEach

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBeFalsy();
  });
});

describe('GET /api/vehicles/search', () => {
  // Extra vehicles on top of CAR001 (BMW/Sports Coupe/Petrol/8995000) and
  // CAR002 (Mercedes-Benz/Sedan/Petrol/4795000) from the outer beforeEach,
  // giving enough spread across make/category/fuelType/price to test filters
  // in combination without changing the fixture the other describe blocks rely on.
  beforeEach(async () => {
    await Vehicle.insertMany([
      {
        vehicleId: 'CAR010',
        make: 'Tesla',
        model: 'Model 3',
        year: 2024,
        price: 4200000,
        category: 'Sedan',
        fuelType: 'Electric',
        stock: 4,
      },
      {
        vehicleId: 'CAR011',
        make: 'Toyota',
        model: 'Fortuner',
        year: 2023,
        price: 3800000,
        category: 'SUV',
        fuelType: 'Diesel',
        stock: 6,
      },
    ]);
  });

  const getAuthToken = async () => {
    const user = await User.create({
      email: 'searcher@example.com',
      password: 'password123',
      role: 'User',
    });
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'test_secret_key', {
      expiresIn: '30d',
    });
  };

  it('should return 401 if not authorized', async () => {
    const res = await request(app).get('/api/vehicles/search');
    expect(res.statusCode).toEqual(401);
  });

  it('should match make or model via the search term (case-insensitive, partial)', async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .get('/api/vehicles/search?search=bmw')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].make).toBe('BMW');
  });

  it('should filter by category', async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .get('/api/vehicles/search?category=Sedan')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    const makes = res.body.data.map(v => v.make).sort();
    expect(makes).toEqual(['Mercedes-Benz', 'Tesla']);
  });

  it('should filter by price range', async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .get('/api/vehicles/search?minPrice=4000000&maxPrice=5000000')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    const makes = res.body.data.map(v => v.make).sort();
    expect(makes).toEqual(['Mercedes-Benz', 'Tesla']);
  });

  it('should sort by price descending', async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .get('/api/vehicles/search?sortBy=price&order=desc')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    const prices = res.body.data.map(v => v.price);
    expect(prices).toEqual([...prices].sort((a, b) => b - a));
  });

  it('should combine category and fuelType filters', async () => {
    const token = await getAuthToken();

    const res = await request(app)
      .get('/api/vehicles/search?category=SUV&fuelType=Diesel')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].make).toBe('Toyota');
  });
});

describe('PUT /api/vehicles/:id', () => {
  // Deviates from requirements.md's literal "Authenticated user" access for this
  // endpoint — restricted to Admin only per explicit user decision.
  const getToken = async (role = 'User') => {
    const user = await User.create({
      email: `updater-${role.toLowerCase()}@example.com`,
      password: 'password123',
      role,
    });
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'test_secret_key', {
      expiresIn: '30d',
    });
  };

  it('should return 401 if not authorized', async () => {
    const vehicle = await Vehicle.findOne({ vehicleId: 'CAR001' });

    const res = await request(app)
      .put(`/api/vehicles/${vehicle._id}`)
      .send({ price: 9000000 });

    expect(res.statusCode).toEqual(401);
  });

  it('should return 403 for an authenticated non-admin user', async () => {
    const token = await getToken('User');
    const vehicle = await Vehicle.findOne({ vehicleId: 'CAR001' });

    const res = await request(app)
      .put(`/api/vehicles/${vehicle._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 9000000 });

    expect(res.statusCode).toEqual(403);
  });

  it('should update a vehicle for an admin user', async () => {
    const token = await getToken('Admin');
    const vehicle = await Vehicle.findOne({ vehicleId: 'CAR001' });

    const res = await request(app)
      .put(`/api/vehicles/${vehicle._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 9500000, stock: 2 });

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBeTruthy();
    expect(res.body.data.price).toBe(9500000);
    expect(res.body.data.stock).toBe(2);

    const inDb = await Vehicle.findById(vehicle._id);
    expect(inDb.price).toBe(9500000);
    expect(inDb.stock).toBe(2);
  });

  it('should return 404 for a non-existent vehicle id', async () => {
    const token = await getToken('Admin');
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .put(`/api/vehicles/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 1000000 });

    expect(res.statusCode).toEqual(404);
  });

  it('should reject an invalid update (negative stock)', async () => {
    const token = await getToken('Admin');
    const vehicle = await Vehicle.findOne({ vehicleId: 'CAR001' });

    const res = await request(app)
      .put(`/api/vehicles/${vehicle._id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ stock: -5 });

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBeFalsy();
  });
});

describe('DELETE /api/vehicles/:id', () => {
  const getToken = async (role = 'User') => {
    const user = await User.create({
      email: `deleter-${role.toLowerCase()}@example.com`,
      password: 'password123',
      role,
    });
    return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'test_secret_key', {
      expiresIn: '30d',
    });
  };

  it('should return 401 if not authorized', async () => {
    const vehicle = await Vehicle.findOne({ vehicleId: 'CAR001' });

    const res = await request(app).delete(`/api/vehicles/${vehicle._id}`);

    expect(res.statusCode).toEqual(401);
  });

  it('should return 403 for an authenticated non-admin user', async () => {
    const token = await getToken('User');
    const vehicle = await Vehicle.findOne({ vehicleId: 'CAR001' });

    const res = await request(app)
      .delete(`/api/vehicles/${vehicle._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(403);

    const stillExists = await Vehicle.findById(vehicle._id);
    expect(stillExists).not.toBeNull();
  });

  it('should delete a vehicle for an admin user', async () => {
    const token = await getToken('Admin');
    const vehicle = await Vehicle.findOne({ vehicleId: 'CAR001' });

    const res = await request(app)
      .delete(`/api/vehicles/${vehicle._id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBeTruthy();

    const inDb = await Vehicle.findById(vehicle._id);
    expect(inDb).toBeNull();
  });

  it('should return 404 for a non-existent vehicle id', async () => {
    const token = await getToken('Admin');
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(app)
      .delete(`/api/vehicles/${fakeId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(404);
  });
});
