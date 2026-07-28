import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import Vehicle from '../models/Vehicle.js';

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

afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('Vehicle Model', () => {
  it('should create a vehicle successfully with all required fields', async () => {
    const validVehicle = new Vehicle({
      vehicleId: 'CAR001',
      make: 'BMW',
      model: 'M4 Competition',
      year: 2024,
      price: 8995000,
      currency: 'INR',
      category: 'Sports Coupe',
      fuelType: 'Petrol',
      featured: true,
      description: 'A high-performance coupe...',
      mileage: 8500,
      color: 'M Sao Paulo Yellow solid',
      stock: 5,
    });

    const savedVehicle = await validVehicle.save();
    
    // We expect mongoose to not throw, and to give us back our properties
    expect(savedVehicle._id).toBeDefined();
    expect(savedVehicle.make).toBe('BMW');
    expect(savedVehicle.stock).toBe(5);
  });

  it('should fail if required fields are missing', async () => {
    const invalidVehicle = new Vehicle({
      make: 'BMW' // Missing model, price, category, etc.
    });

    let err;
    try {
      await invalidVehicle.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    expect(err.errors.model).toBeDefined();
    expect(err.errors.price).toBeDefined();
    expect(err.errors.category).toBeDefined();
    expect(err.errors.stock).toBeDefined();
  });
});
