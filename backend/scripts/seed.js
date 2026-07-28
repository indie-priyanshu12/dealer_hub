import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Vehicle from '../models/Vehicle.js';

dotenv.config({ path: '../.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dealer_hub';

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(DB_URI);
    console.log('Connected!');

    // Read the JSON file
    const dataPath = path.join(__dirname, '../../public/inventory_data/car_data.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    const cars = JSON.parse(rawData);

    // Transform string stock ("In Stock", "Limited Stock") into numbers so it matches the Schema
    const vehiclesToInsert = cars.map(car => {
      let stockNum = 1; // default
      if (typeof car.stock === 'string') {
        if (car.stock.toLowerCase().includes('out')) stockNum = 0;
        else if (car.stock.toLowerCase().includes('limited')) stockNum = 2;
        else if (car.stock.toLowerCase().includes('in stock')) stockNum = 5;
      } else if (typeof car.stock === 'number') {
        stockNum = car.stock;
      }

      return {
        ...car,
        vehicleId: car.id, // schema uses vehicleId instead of id
        stock: stockNum
      };
    });

    console.log('Clearing existing vehicles...');
    await Vehicle.deleteMany({});

    console.log(`Inserting ${vehiclesToInsert.length} vehicles...`);
    await Vehicle.insertMany(vehiclesToInsert);

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
