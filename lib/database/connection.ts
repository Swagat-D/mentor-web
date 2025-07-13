import { MongoClient, Db } from 'mongodb';

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

if (!process.env.MONGODB_DB_NAME) {
  throw new Error('Please define the MONGODB_DB_NAME environment variable');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME;

interface MongoConnection {
  client: MongoClient;
  db: Db;
}

let cachedConnection: MongoConnection | null = null;

export async function connectToDatabase(): Promise<MongoConnection> {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const client = new MongoClient(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
    });

    await client.connect();
    const db = client.db(dbName);

    // Test the connection
    await db.admin().ping();
    console.log('Connected to MongoDB successfully');

    // Create indexes
    await createIndexes(db);

    cachedConnection = { client, db };
    return cachedConnection;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

async function createIndexes(db: Db): Promise<void> {
  try {
    // Users collection indexes
    await db.collection('users').createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { emailVerificationToken: 1 } },
      { key: { passwordResetToken: 1 } },
      { key: { role: 1 } },
      { key: { createdAt: 1 } },
    ]);

    // Mentor profiles indexes
    await db.collection('mentorProfiles').createIndexes([
      { key: { userId: 1 }, unique: true },
      { key: { expertise: 1 } },
      { key: { location: 1 } },
      { key: { languages: 1 } },
      { key: { isProfileComplete: 1 } },
    ]);

    // Sessions indexes
    await db.collection('sessions').createIndexes([
      { key: { mentorId: 1 } },
      { key: { studentId: 1 } },
      { key: { scheduledAt: 1 } },
      { key: { status: 1 } },
    ]);

    //notification collections indexes
    await db.collection('notifications').createIndexes([
      { key: { userId: 1, createdAt: -1 } },
      { key: { userId: 1, read: 1 } },
      { key: { type: 1 } },
      { key: { expiresAt: 1 }, expireAfterSeconds: 0 },
    ]);

    await db.collection('notificationPreferences').createIndexes([
      { key: { userId: 1 }, unique: true },
    ]);

    console.log('Database indexes created successfully');
  } catch (error) {
    console.error('Error creating indexes:', error);
  }
}