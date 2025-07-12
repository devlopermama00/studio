
import mongoose from 'mongoose';

// To prevent TypeScript errors on the global object
declare global {
  var mongoose: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  }
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }
  
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env.local. A valid connection string is required to connect to the database.'
    );
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: 'DayTourGuides',
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    if (e instanceof Error && e.message.includes('querySrv EBADNAME')) {
        throw new Error(
            'Database connection failed due to an invalid hostname. This is often caused by an incorrect MONGODB_URI in your .env.local file. Please ensure it is correct and that your IP address is whitelisted in your MongoDB Atlas project.'
        );
    }
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
