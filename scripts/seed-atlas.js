const { MongoClient } = require('mongodb');

const uri =
  process.env.MONGODB_URI ||
  'mongodb+srv://mcrisanto_db_user:PflNS4SN7Zj8qfxy@cluster0.zdoypjf.mongodb.net/?appName=Cluster0';

const sampleGames = [
  {
    playerName: 'Nova',
    score: 420,
    level: 5,
    streak: 4,
    status: 'active',
    notes: 'Perfect combo run',
    createdAt: new Date()
  },
  {
    playerName: 'Kira',
    score: 310,
    level: 4,
    streak: 3,
    status: 'finished',
    notes: 'Saved the final boss',
    createdAt: new Date()
  },
  {
    playerName: 'Zen',
    score: 580,
    level: 6,
    streak: 6,
    status: 'active',
    notes: 'High score this week',
    createdAt: new Date()
  }
];

(async () => {
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 15000,
    connectTimeoutMS: 15000,
    socketTimeoutMS: 15000
  });

  try {
    await client.connect();
    const db = client.db('galaxy_run');
    const collection = db.collection('games');

    await collection.deleteMany({});
    const result = await collection.insertMany(sampleGames);

    console.log('CONNECTED_TO_ATLAS=true');
    console.log('INSERTED_COUNT=' + result.insertedCount);
    console.log(JSON.stringify(await collection.find({}).sort({ createdAt: -1 }).limit(10).toArray(), null, 2));
  } catch (error) {
    console.error('ATLAS_CONNECTION_ERROR');
    console.error(error.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
})();
