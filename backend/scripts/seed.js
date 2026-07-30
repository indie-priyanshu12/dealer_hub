import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Vehicle from '../models/Vehicle.js';
import VehicleImage from '../models/VehicleImage.js';

// Seeds the database — vehicles AND their photos — entirely from backend-owned data
// (backend/data/). The frontend's public/inventory_data/car_data.json is deliberately
// NOT the source anymore: it holds only the 6-car logged-out demo, so seeding from it
// would wipe the full inventory down to the demo set. Photos are stored as binary
// VehicleImage documents and served by GET /api/vehicles/:id/images/:n, keeping the
// database (not the frontend bundle) the source of truth for inventory media.
// Resolves every path from this file's location, so it runs the same from the repo
// root or backend/ — point MONGODB_URI at the deployed cluster to seed production.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env.local') });

const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dealer_hub';
const DATA_PATH = path.join(__dirname, '../data/car_data_full.json');
const IMAGES_ROOT = path.join(__dirname, '../data/car_images');

// Folder names don't derive cleanly from vehicle data (e.g. "benz", the "x_trial"
// typo), so the mapping is explicit. A vehicle with no entry here simply seeds
// without gallery photos, keeping any external image URL it carries in the JSON.
const VEHICLE_IMAGE_FOLDERS = {
  CAR001: 'm4_competition',
  CAR002: 'benz',
  CAR003: 'a6',
  CAR004: 'model_3',
  CAR005: '911_carrera',
  CAR006: 'camry_hybrid',
  CAR007: 'civic_rs',
  CAR008: 'mustang_gt',
  CAR009: 'landrover_sport',
  CAR010: 'xc60',
  CAR011: 'ioniq_5',
  CAR012: 'ev6_gt',
  CAR013: 'cx-5',
  CAR014: 'golf_gti',
  CAR015: 'x_trial',
  CAR016: 'rx_500h',
  CAR017: 'corvette_stingray',
  CAR018: 'f-pace',
  CAR019: 'mini_cooper_s',
  CAR020: 'subaru_outback',
};

const CONTENT_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.avif': 'image/avif',
  '.webp': 'image/webp',
};

// Files are named "img (1).jpeg", "img (2).jpeg", … — order by that number.
const galleryFiles = (folder) => {
  const dir = path.join(IMAGES_ROOT, folder);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => CONTENT_TYPES[path.extname(f).toLowerCase()])
    .map((f) => ({ file: f, n: Number((f.match(/\((\d+)\)/) || [])[1] || 0) }))
    .sort((a, b) => a.n - b.n)
    .map(({ file }) => path.join(dir, file));
};

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(DB_URI);
    console.log('Connected!');

    const cars = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

    console.log('Clearing existing vehicles and vehicle images...');
    await Vehicle.deleteMany({});
    await VehicleImage.deleteMany({});

    console.log(`Inserting ${cars.length} vehicles...`);
    let totalImages = 0;

    for (const car of cars) {
      const vehicle = await Vehicle.create(car);

      const folder = VEHICLE_IMAGE_FOLDERS[vehicle.vehicleId];
      const files = folder ? galleryFiles(folder) : [];
      if (files.length === 0) {
        console.log(`  ${vehicle.vehicleId}  ${vehicle.make} ${vehicle.model} — no local photos${vehicle.image ? ' (kept external image URL)' : ''}`);
        continue;
      }

      await VehicleImage.insertMany(files.map((filePath, i) => ({
        vehicle: vehicle._id,
        index: i + 1,
        contentType: CONTENT_TYPES[path.extname(filePath).toLowerCase()],
        data: fs.readFileSync(filePath),
      })));

      const urls = files.map((_, i) => `/api/vehicles/${vehicle._id}/images/${i + 1}`);
      vehicle.image = urls[0];
      vehicle.images = urls;
      await vehicle.save();

      totalImages += files.length;
      console.log(`  ${vehicle.vehicleId}  ${vehicle.make} ${vehicle.model} — ${files.length} photos`);
    }

    console.log(`Seed completed: ${cars.length} vehicles, ${totalImages} photos stored in MongoDB.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
