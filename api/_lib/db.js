import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

let cached = globalThis._mongooseConn;
if (!cached) {
  cached = globalThis._mongooseConn = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI manquant dans les variables d\'environnement');
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { bufferCommands: false }).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
