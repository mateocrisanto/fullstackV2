const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('MONGODB_URI is not defined');
  }

  await mongoose.connect(mongoUri, {
    dbName: process.env.MONGO_DB_NAME || 'galaxy_run'
  });

  console.log('MongoDB connected');
  return mongoose.connection;
};

module.exports = { connectDB };
