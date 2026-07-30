import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app.js';
import { seedAdminUser } from './utils/seedAdminUser.js';

dotenv.config({ path: '../.env.local' });

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/dealer_hub';

// Connect to MongoDB
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Successfully connected to MongoDB!');
    await seedAdminUser();

    // Start Server
    app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  });
