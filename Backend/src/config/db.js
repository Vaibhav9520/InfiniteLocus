import mongoose from 'mongoose';

function normalizeMongoUri(input) {
  const fallback = 'mongodb://127.0.0.1:27017/infinitelocus_canteen';
  if (!input || typeof input !== 'string') return fallback;
  const trimmed = input.trim();

  // Already a full URI
  if (trimmed.startsWith('mongodb://') || trimmed.startsWith('mongodb+srv://')) {
    return trimmed;
  }

  // If only a port number like "27017" or "2005"
  if (/^\d+$/.test(trimmed)) {
    return `mongodb://127.0.0.1:${trimmed}/infinitelocus_canteen`;
  }

  // If host:port
  if (/^[^\s:]+:\d+$/.test(trimmed)) {
    return `mongodb://${trimmed}/infinitelocus_canteen`;
  }

  // If hostname only
  if (/^[A-Za-z0-9_.-]+$/.test(trimmed)) {
    return `mongodb://${trimmed}:27017/infinitelocus_canteen`;
  }

  return fallback;
}

export async function connectToDatabase(uri) {
  const rawUri = uri || process.env.MONGODB_URI;
  const mongoUri = normalizeMongoUri(rawUri);

  if (mongoose.connection.readyState === 1) return mongoose.connection;

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(mongoUri, {
      autoIndex: true,
      serverSelectionTimeoutMS: 10000,
    });
  } catch (err) {
    console.error('[db] failed to connect to', mongoUri);
    console.error('[db] error:', err?.message || err);
    throw err;
  }

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
