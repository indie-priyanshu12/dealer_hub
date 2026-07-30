import mongoose from 'mongoose';

// One document per successful purchase. Buyer and vehicle details are snapshotted
// (not just referenced) so history stays truthful even if the vehicle is later
// deleted, re-priced, or the user account changes — a receipt, not a live join.
const purchaseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: {
    type: String,
  },
  userEmail: {
    type: String,
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  vehicleId: {
    type: String,
  },
  make: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  category: {
    type: String,
  },
  image: {
    type: String,
  },
  pricePaid: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
}, { timestamps: true });

purchaseSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('Purchase', purchaseSchema);
