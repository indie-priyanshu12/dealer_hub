import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import { normalizeOrigin } from './utils/normalizeOrigin.js';

const app = express();

// Locked to the deployed frontend's origin once CLIENT_URL is set (e.g. on
// Render); left wide open otherwise so local dev and the test suite are
// unaffected. normalizeOrigin repairs the two most common ways a hand-typed
// dashboard env var goes wrong (missing scheme, trailing slash).
const clientOrigin = normalizeOrigin(process.env.CLIENT_URL);
app.use(cors(clientOrigin ? { origin: clientOrigin } : undefined));
// Default json limit is 100kb — far too small for POST /api/vehicles' base64
// imageUploads (a single showroom photo can exceed 1MB). Sized to comfortably fit
// createVehicle's cap of 12 images × 8MB decoded is overkill; real galleries here
// run ~100-500KB per photo, so 20mb leaves generous headroom without being unbounded.
app.use(express.json({ limit: '20mb' }));
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/purchases', purchaseRoutes);

// Error handling middleware. The unused 4th parameter is required — Express only
// treats a middleware as an error handler when its function takes exactly 4 args.
app.use((err, req, res, _next) => {
  console.error('Server error:', err);
  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Internal Server Error' });
});

export default app;
