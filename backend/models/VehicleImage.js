import mongoose from 'mongoose';

// Vehicle photos live in MongoDB (not the frontend public folder) so the backend +
// database are the single source of truth for inventory media. Each document is one
// image; `index` is its 1-based position in the vehicle's gallery.
const vehicleImageSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  index: {
    type: Number,
    required: true,
    min: 1,
  },
  contentType: {
    type: String,
    required: true,
  },
  data: {
    type: Buffer,
    required: true,
  },
}, { timestamps: true });

vehicleImageSchema.index({ vehicle: 1, index: 1 }, { unique: true });

export default mongoose.model('VehicleImage', vehicleImageSchema);
