import { MongoClient } from 'mongodb';

require('dotenv').config();

const { DB_URL } = process.env;
const dbName = 'prytaneum-auth';

const client = new MongoClient(DB_URL, { useUnifiedTopology: true });
const connected = client.connect().then((connection) => connection.db(dbName));

export default function MongoCollection(name) {
    return connected.then((db) => {
        this.collection = db.collection(name);
    });
}
