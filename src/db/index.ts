import { Collection } from 'mongodb';

import initUsers, { UserDoc } from './users';
import { connectToMongo } from './mongo';

/**
 * re-export anything from the collection files
 */
export { close } from './mongo';
export * as UserUtils from './users';

/**
 * declare collections here, they won't be undefined before being called
 * guaranteed by calling connect on startup before we ever use any collections
 */
let Users: Collection<UserDoc>;

/**
 * connects to mongo and initializes collections
 */
export async function connect(): Promise<void> {
    await connectToMongo();
    Users = initUsers();
}

export default {
    Users: (): Collection<UserDoc> => Users,
};
