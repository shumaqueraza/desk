import mongoose from "mongoose";

/**
 * MongoDB (Atlas) connection singleton.
 * One cached promise per process so hot reloads and serverless invocations
 * reuse the same connection instead of opening a socket per request.
 *
 * Tuned for flaky networks / Atlas M0:
 * - maxIdleTimeMS closes idle sockets before NAT gateways/ISPs silently kill
 *   them, so the next operation pays a cheap reconnect instead of dying with
 *   ECONNRESET mid-operation.
 * - generous timeouts so slow cold connects do not get cut off.
 * - retryReads (retryWrites comes from the URI) so a single network blip is
 *   retried by the driver instead of surfacing as a 500.
 * - a failed connection attempt clears the cached promise, so the next
 *   request retries the connection instead of reusing a rejected promise.
 */

// MONGODB_URI is read lazily (inside connectDB), not validated at module
// load: `next build` collects page data without runtime env vars, and the
// error should surface only when a connection is actually attempted.

const MONGODB_URI: string = process.env.MONGODB_URI ?? "";

const CONNECTION_OPTIONS = {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 60000,
  maxIdleTimeMS: 30000,
  maxPoolSize: 10,
  retryReads: true,
  // Force IPv4. Broken IPv6 paths on Windows are a classic source of
  // ECONNRESET against Atlas SRV targets; IPv4 is always available.
  family: 4,
} as const;

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalForMongoose = globalThis as unknown as { mongoose?: MongooseCache };

const cache: MongooseCache =
  globalForMongoose.mongoose ?? (globalForMongoose.mongoose = { conn: null, promise: null });

export async function connectDB(): Promise<typeof mongoose> {
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Copy .env.example to .env and paste your Atlas connection string.",
    );
  }
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose.connect(MONGODB_URI, CONNECTION_OPTIONS).catch((err) => {
      // Allow the next request to retry instead of caching the rejection.
      cache.promise = null;
      cache.conn = null;
      throw err;
    });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
