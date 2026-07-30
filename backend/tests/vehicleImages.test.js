import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import app from '../app.js';
import Vehicle from '../models/Vehicle.js';
import VehicleImage from '../models/VehicleImage.js';

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

const seedVehicle = () =>
  Vehicle.create({
    vehicleId: 'IMG-CAR-001',
    make: 'BMW',
    model: 'M4 Competition',
    price: 8995000,
    category: 'Sports Coupe',
    stock: 5,
  });

const JPEG_BYTES = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);

describe('GET /api/vehicles/:id/images/:index', () => {
  it('serves the stored image bytes with its content type, without requiring auth', async () => {
    const vehicle = await seedVehicle();
    await VehicleImage.create({
      vehicle: vehicle._id,
      index: 1,
      contentType: 'image/jpeg',
      data: JPEG_BYTES,
    });

    // Deliberately NO Authorization header: <img src> requests cannot attach a JWT,
    // so image serving must stay public even though vehicle data endpoints are protected.
    const res = await request(app).get(`/api/vehicles/${vehicle._id}/images/1`);

    expect(res.statusCode).toEqual(200);
    expect(res.headers['content-type']).toBe('image/jpeg');
    expect(Buffer.compare(res.body, JPEG_BYTES)).toBe(0);
  });

  it('returns 404 for a vehicle that has no image at that index', async () => {
    const vehicle = await seedVehicle();
    await VehicleImage.create({
      vehicle: vehicle._id,
      index: 1,
      contentType: 'image/jpeg',
      data: JPEG_BYTES,
    });

    const res = await request(app).get(`/api/vehicles/${vehicle._id}/images/2`);

    expect(res.statusCode).toEqual(404);
    expect(res.body.success).toBe(false);
  });

  it('returns 404 for a non-existent vehicle id', async () => {
    const missingId = new mongoose.Types.ObjectId();

    const res = await request(app).get(`/api/vehicles/${missingId}/images/1`);

    expect(res.statusCode).toEqual(404);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for a malformed vehicle id', async () => {
    const res = await request(app).get('/api/vehicles/not-a-real-id/images/1');

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 for a non-numeric image index', async () => {
    const vehicle = await seedVehicle();

    const res = await request(app).get(`/api/vehicles/${vehicle._id}/images/cover`);

    expect(res.statusCode).toEqual(400);
    expect(res.body.success).toBe(false);
  });
});
