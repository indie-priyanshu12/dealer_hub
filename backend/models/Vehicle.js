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
  stock: {
    type: Number,
    required: true,
    min: 0,
  }
}, { timestamps: true });

export default mongoose.model('Vehicle', vehicleSchema);
