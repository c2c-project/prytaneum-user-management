import Mongo from '../config/mongo.config';
import Users from './users';

export default async function (): Promise<void> {
    await Mongo.init();
    await Users.init();
}
