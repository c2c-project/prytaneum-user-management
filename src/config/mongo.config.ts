import { MongoClient, Db, Collection } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config();

const { DB_URL } = process.env;
const dbName = 'prytaneum-auth';

export default (function () {
    const client = new MongoClient(DB_URL, { useUnifiedTopology: true });
    const connect = () =>
        client
            .connect()
            .then((connection: MongoClient) => connection.db(dbName));

    let connection: Promise<Db> | undefined;

    return {
        init() {
            connection = connect();
            return connection;
        },
        async collection<T>(name: string): Promise<Collection<T>> {
            if (!connection) {
                throw new Error('Not connected to the db yet');
            }
            const db = await connection;
            return db.collection(name);
            // return connection.then((db) => db.collection(name));
        },
        close() {
            return client.close();
        },
    };
})();
