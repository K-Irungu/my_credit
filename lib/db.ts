import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

// Throw an error immediately if the URI is not set, as it's a critical dependency.
if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable in .env');
}

// Global cache for the connection object to prevent creating multiple connections in development.
let cached = global._mongoose;

if (!cached) {
    cached = global._mongoose = { conn: null, promise: null };
}

export async function connectToDB(): Promise<Mongoose> {
    // If a connection already exists, return it immediately.
    if (cached.conn) {
        return cached.conn;
    }

    // If a connection promise is not yet cached, create it.
    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
        };

        cached.promise = mongoose
            .connect(MONGODB_URI, opts)
            .then(m => {
                cached.conn = m;
                return m;
            })
            .catch(error => {
                // Clear the promise if connection fails to allow retries.
                cached.promise = null;
                throw error;
            });
    }

    // Await the promise to get the connection.
    return cached.promise;
}