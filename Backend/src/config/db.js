import mongoose from 'mongoose';

export async function connectToDatabase(uri) {
  const mongoUri = uri || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/infinitelocus_canteen';
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  mongoose.set('strictQuery', true);

  await mongoose.connect(mongoUri, {
    autoIndex: true,
  });

  mongoose.connection.on('connected', () => {
    console.log('[db] connected');
  });
  mongoose.connection.on('error', (err) => {
    console.error('[db] connection error:', err);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('[db] disconnected');
  });

  return mongoose.connection;
}
