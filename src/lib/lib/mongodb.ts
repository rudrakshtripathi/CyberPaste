// src/lib/mongodb.ts
import { MongoClient, Collection } from 'mongodb';

let _client: MongoClient | null = null;

function getRequiredEnv(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

export async function getPastesCollection(): Promise<Collection> {
  if (!_client) {
    const uri = getRequiredEnv('MONGODB_URI');
    _client = new MongoClient(uri);
    await _client.connect();
  }

  const dbName = process.env.MONGODB_DB || 'cyberpaste';
  const db = _client.db(dbName);
  const col = db.collection('pastes');

  // Idempotent index creation (Mongo will no-op if they already exist)
  // TTL index: each doc has its own expiresAt date; Mongo removes after that time.
  await col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
  await col.createIndex({ createdAt: 1 });

  return col;
}
