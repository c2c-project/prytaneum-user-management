import { MongoClient } from 'mongodb';

require('dotenv').config();

const { DB_URL } = process.env;
const dbName = 'prytaneum-auth';

export default (function () {
    const client = new MongoClient(DB_URL, { useUnifiedTopology: true });
    const connect = () =>
        client.connect().then((connection) => connection.db(dbName));

    let connection;

    return {
        init() {
            connection = connect();
            return connection;
        },
        collection(name) {
            return connection.then((db) => db.collection(name));
        },
        close() {
            return client.close();
        },
    };
})();
