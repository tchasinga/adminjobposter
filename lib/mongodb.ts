import { MongoClient, Db } from 'mongodb';

const DATABASE_URL = process.env.MONGODB_URI || 'mongodb+srv://tchasingajacques:jack202050081@dashboard.v4ujex0.mongodb.net/?retryWrites=true&w=majority&appName=dashboard';

if (!DATABASE_URL) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

interface MongoDBConnection {
  client: MongoClient;
  db: Db;
}

interface ConnectionStatus {
  connected: boolean;
  message: string;
  error?: string;
}

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase(): Promise<MongoDBConnection> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  const client = new MongoClient(DATABASE_URL, {
    // These options are recommended for MongoDB Driver
    connectTimeoutMS: 10000, // 10 seconds
    socketTimeoutMS: 30000, // 30 seconds
    serverSelectionTimeoutMS: 5000, // 5 seconds
    maxPoolSize: 50, // Maximum number of connections in the pool
  });

  try {
    await client.connect();
    const db = client.db('dashboard'); // Replace with your database name if different

    cachedClient = client;
    cachedDb = db;

    return { client, db };
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

export async function checkMongoDBConnection(): Promise<ConnectionStatus> {
  try {
    const { client } = await connectToDatabase();
    
    // Run a simple command to verify connection
    await client.db().command({ ping: 1 });
    return { 
      connected: true,
      message: 'Successfully connected to MongoDB' 
    };
  } catch (error) {
    return { 
      connected: false,
      message: 'Failed to connect to MongoDB',
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Utility function to get the database instance
export async function getDb(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}