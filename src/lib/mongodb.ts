/**
 * mongodb.ts – Cached MongoDB client for Vercel serverless functions.
 *
 * Uses a global variable to reuse the MongoClient across hot-reloads in
 * development and across invocations in the same container on Vercel.
 *
 * All env reads are lazy (inside functions) so that:
 *  - Build-time analysis never fails due to missing env vars.
 *  - Callers that catch errors get the "MONGODB_URI not set" error properly.
 */
import { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

function createClientPromise(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    return Promise.reject(new Error("MONGODB_URI is not set"));
  }
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = new MongoClient(uri).connect();
    }
    return global._mongoClientPromise;
  }
  return new MongoClient(uri).connect();
}

/** Returns the connected MongoClient. Rejects if MONGODB_URI is unset. */
export async function getClient(): Promise<MongoClient> {
  return createClientPromise();
}

/** Returns the target database. Rejects if MONGODB_URI is unset. */
export async function getDb() {
  const client = await getClient();
  const dbName = process.env.MONGODB_DB ?? "predictiq";
  return client.db(dbName);
}
