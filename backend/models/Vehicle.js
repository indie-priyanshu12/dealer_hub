import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  vehicleId: {
    type: String,
    required: true,
    unique: true
  },
  make: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
  },
  price: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR'
  },
  category: {
    type: String,
    required: true,
  },
  fuelType: {
    type: String,
  },
  featured: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
  },
  mileage: {
    type: Number,
  },
  color: {
    type: String,
  },
  image: {
    type: String,
  },
  // API URL paths for the full gallery (e.g. /api/vehicles/<id>/images/1). `image`
  // above stays the primary/cover shot; both are filled in by the seed script.
  images: {
    type: [String],
    default: undefined,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
  }
}, { timestamps: true });

export default mongoose.model('Vehicle', vehicleSchema);
