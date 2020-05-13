import { MongoClient } from 'mongodb';

require('dotenv').config();

const { DB_URL } = process.env;
const dbName = 'prytaneum-auth';

const client = new MongoClient(DB_URL, { useUnifiedTopology: true })
    .connect()
    .catch(console.err); // TODO: real logging here

export default (collectionName) =>
    client.then(() => client.db(dbName).collection(collectionName));
