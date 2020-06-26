import { MongoClient, Db, Collection } from 'mongodb';
import config from 'config/mongo';

const { dbName, url } = config;

function Mongo() {
    const client = new MongoClient(url, { useUnifiedTopology: true });
    const connect = () =>
        client
            .connect()
            .then((connection: MongoClient) => connection.db(dbName));

    let dbInstance: Db;

    return {
        async init() {
            dbInstance = await connect();
            return dbInstance;
        },
        collection<T>(name: string): Collection<T> {
            return dbInstance.collection<T>(name);
        },
        close() {
            return client.close();
        },
    };
}

export default Mongo();
