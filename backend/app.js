import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/authRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';

const app = express();

// Locked to the deployed frontend's origin once CLIENT_URL is set (e.g. on
// Render); left wide open otherwise so local dev and the test suite are
// unaffected.
app.use(cors(process.env.CLIENT_URL ? { origin: process.env.CLIENT_URL } : undefined));
app.use(express.json());
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Internal Server Error' });
});

export default app;
