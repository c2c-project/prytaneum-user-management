import Mongo from './mongo';
import Users from './users';

export default async function (): Promise<void> {
    await Mongo.init();
    await Users.init();
}
