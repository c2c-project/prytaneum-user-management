import { MongoClient } from 'mongodb';

require('dotenv').config();

const { DB_URL } = process.env;
const dbName = 'prytaneum-auth';

// const client = MongoClient.connect(DB_URL, { useUnifiedTopology: true }).catch(
//     console.err
// ); // TODO: real logging here

// export default class MongoCollection {
//     constructor(name) {
//         this.name = name;
//         this.connect();
//     }

//     async connect() {
//         try {
//             await client.db(dbName).collection(this.name);
//             return this;
//         } catch (e) {
//             return e;
//         }
//     }
// }

export default function MongoCollection(name) {
    const client = new MongoClient(DB_URL, { useUnifiedTopology: true });
    // client.connect((connected) => {
    //     const connected.db(dbName);
    // });
    client.connect().then((connected) => {
        this.collection = connected.db(dbName).collection(name);
    });
}
