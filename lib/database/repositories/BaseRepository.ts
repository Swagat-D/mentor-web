import { MongoClient, Db, Collection, ObjectId, Filter, UpdateFilter } from 'mongodb';
import clientPromise from '../../mongodb';

export abstract class BaseRepository<T extends import('mongodb').Document> {
  protected client: MongoClient | null = null;
  protected db: Db | null = null;
  protected collection: Collection<T> | null = null;
  protected collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  protected async getCollection(): Promise<Collection<T>> {
    if (!this.collection) {
      this.client = await clientPromise;
      this.db = this.client.db(process.env.MONGODB_DB_NAME || 'mentormatch');
      this.collection = this.db.collection<T>(this.collectionName);
    }
    return this.collection;
  }

  async findById(id: string | ObjectId): Promise<import('mongodb').WithId<T> | null> {
    const collection = await this.getCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    return await collection.findOne({ _id: objectId } as Filter<T>);
  }

  async findOne(filter: Filter<T>): Promise<import('mongodb').WithId<T> | null> {
    const collection = await this.getCollection();
    return await collection.findOne(filter);
  }

  async findMany(
    filter: Filter<T> = {},
    options: {
      limit?: number;
      skip?: number;
      sort?: Record<string, 1 | -1>;
    } = {}
  ): Promise<{ items: import('mongodb').WithId<T>[]; total: number }> {
    const collection = await this.getCollection();
    
    const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;
    
    const [items, total] = await Promise.all([
      collection.find(filter).sort(sort).skip(skip).limit(limit).toArray(),
      collection.countDocuments(filter)
    ]);

    return { items, total };
  }

  async create(data: Omit<T, '_id'>): Promise<T> {
    const collection = await this.getCollection();
    const now = new Date();
    
    const documentToInsert = {
      ...data,
      createdAt: now,
      updatedAt: now,
    } as unknown as import('mongodb').OptionalUnlessRequiredId<T>;

    const result = await collection.insertOne(documentToInsert);
    return { ...documentToInsert, _id: result.insertedId } as T;
  }

  async update(id: string | ObjectId, data: Partial<T>): Promise<T | null> {
    const collection = await this.getCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const updateDoc: UpdateFilter<T> = {
      $set: {
        ...data,
        updatedAt: new Date(),
      } as Partial<T>,
    };

    const result = await collection.findOneAndUpdate(
      { _id: objectId } as Filter<T>,
      updateDoc,
      { returnDocument: 'after' }
    );

    return result && 'value' in result ? result.value as T : null;
  }

  async delete(id: string | ObjectId): Promise<boolean> {
    const collection = await this.getCollection();
    const objectId = typeof id === 'string' ? new ObjectId(id) : id;
    
    const result = await collection.deleteOne({ _id: objectId } as Filter<T>);
    return result.deletedCount > 0;
  }

  async exists(filter: Filter<T>): Promise<boolean> {
    const collection = await this.getCollection();
    const count = await collection.countDocuments(filter, { limit: 1 });
    return count > 0;
  }
}