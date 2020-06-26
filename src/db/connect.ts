import Mongo from './mongo';
import Users from './users';

export default async function (): Promise<void> {
    // must wait for mongo to initialize before we initialize all the collections
    await Mongo.init();
    
    Users.init();
}
