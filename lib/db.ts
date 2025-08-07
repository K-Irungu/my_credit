import mongoose from 'mongoose';
import logger from './logger';

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
    logger.error('MONGODB_URI not defined');
    throw new Error('Please define the MONGODB_URI environment variable in .env');
}

declare global {
    var _mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
}

const cached = globalThis._mongoose || { conn: null, promise: null };
globalThis._mongoose = cached;

export async function connectToDB(): Promise<typeof mongoose> {
    if (cached.conn) {
        logger.debug('Using cached MongoDB connection');
        return cached.conn;
    }
    logger.info('Connecting to MongoDB', { uri: MONGODB_URI });
    if (!cached.promise) {
        cached.promise = mongoose
            // @ts-ignore
            .connect(MONGODB_URI)
            .then((m) => {
                logger.info('MongoDB connection established');
                return m;
            })
            .catch((err) => {
                logger.error('MongoDB connection error', err);
                throw err;
            });
    }
    cached.conn = await cached.promise;
    return cached.conn;
}

