import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import Vehicle from '../models/Vehicle.js';
import User from '../models/User.js';
import Purchase from '../models/Purchase.js';

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

const makeUser = async (role = 'User', tag = 'buyer') => {
  const user = await User.create({
    name: `${tag} ${role}`,
    email: `${tag}-${role.toLowerCase()}@example.com`,
    password: 'password123',
    role,
  });
  const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'test_secret_key', {
    expiresIn: '30d',
  });
  return { user, token };
};

const makeVehicle = (overrides = {}) =>
  Vehicle.create({
    vehicleId: 'CAR001',
    make: 'BMW',
    model: 'M4 Competition',
    price: 8995000,
    currency: 'INR',
    category: 'Sports Coupe',
    stock: 3,
    image: '/api/vehicles/someid/images/1',
    ...overrides,
  });

describe('POST /api/vehicles/:id/purchase — purchase recording', () => {
  it('decreases stock by exactly 1 and records who bought what, when, and at what price', async () => {
    const { user, token } = await makeUser();
    const vehicle = await makeVehicle();

    const res = await request(app)
      .post(`/api/vehicles/${vehicle._id}/purchase`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.data.stock).toBe(2);

    const inDb = await Vehicle.findById(vehicle._id);
    expect(inDb.stock).toBe(2);

    const purchases = await Purchase.find({ user: user._id });
    expect(purchases).toHaveLength(1);
    const record = purchases[0];
    expect(record.userName).toBe(user.name);
    expect(record.userEmail).toBe(user.email);
    expect(String(record.vehicle)).toBe(String(vehicle._id));
    expect(record.vehicleId).toBe('CAR001');
    expect(record.make).toBe('BMW');
    expect(record.model).toBe('M4 Competition');
    expect(record.pricePaid).toBe(8995000);
    expect(record.currency).toBe('INR');
    expect(record.createdAt).toBeInstanceOf(Date);
  });

  it('records one purchase per successful buy', async () => {
    const { token } = await makeUser();
    const vehicle = await makeVehicle({ stock: 2 });

    await request(app).post(`/api/vehicles/${vehicle._id}/purchase`).set('Authorization', `Bearer ${token}`);
    await request(app).post(`/api/vehicles/${vehicle._id}/purchase`).set('Authorization', `Bearer ${token}`);

    expect(await Purchase.countDocuments()).toBe(2);
    expect((await Vehicle.findById(vehicle._id)).stock).toBe(0);
  });

  it('does not record a purchase when the vehicle is out of stock', async () => {
    const { token } = await makeUser();
    const vehicle = await makeVehicle({ stock: 0 });

    const res = await request(app)
      .post(`/api/vehicles/${vehicle._id}/purchase`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(400);
    expect(await Purchase.countDocuments()).toBe(0);
  });
});

describe('GET /api/purchases/mine', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/purchases/mine');
    expect(res.statusCode).toEqual(401);
  });

  it("returns only the caller's purchases, newest first", async () => {
    const alice = await makeUser('User', 'alice');
    const bob = await makeUser('User', 'bob');
    const vehicle = await makeVehicle({ stock: 5 });

    await request(app).post(`/api/vehicles/${vehicle._id}/purchase`).set('Authorization', `Bearer ${alice.token}`);
    await request(app).post(`/api/vehicles/${vehicle._id}/purchase`).set('Authorization', `Bearer ${bob.token}`);
    await request(app).post(`/api/vehicles/${vehicle._id}/purchase`).set('Authorization', `Bearer ${alice.token}`);

    const res = await request(app)
      .get('/api/purchases/mine')
      .set('Authorization', `Bearer ${alice.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(2);
    expect(res.body.data.every((p) => p.userEmail === alice.user.email)).toBe(true);

    const times = res.body.data.map((p) => new Date(p.createdAt).getTime());
    expect(times[0]).toBeGreaterThanOrEqual(times[1]);
  });
});

describe('GET /api/purchases (admin)', () => {
  it('rejects unauthenticated calls', async () => {
    const res = await request(app).get('/api/purchases');
    expect(res.statusCode).toEqual(401);
  });

  it('rejects non-admin users', async () => {
    const { token } = await makeUser();
    const res = await request(app).get('/api/purchases').set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(403);
  });

  it("returns every user's purchases with buyer details for an admin", async () => {
    const alice = await makeUser('User', 'alice');
    const bob = await makeUser('User', 'bob');
    const admin = await makeUser('Admin', 'boss');
    const vehicle = await makeVehicle({ stock: 5 });

    await request(app).post(`/api/vehicles/${vehicle._id}/purchase`).set('Authorization', `Bearer ${alice.token}`);
    await request(app).post(`/api/vehicles/${vehicle._id}/purchase`).set('Authorization', `Bearer ${bob.token}`);

    const res = await request(app)
      .get('/api/purchases')
      .set('Authorization', `Bearer ${admin.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.count).toBe(2);
    const emails = res.body.data.map((p) => p.userEmail).sort();
    expect(emails).toEqual([alice.user.email, bob.user.email].sort());
    expect(res.body.data[0].userName).toBeTruthy();
    expect(res.body.data[0].pricePaid).toBe(8995000);
  });
});
