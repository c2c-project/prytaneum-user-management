// TODO Type still need to be modify when proper schema for User is created

export interface userStatus {
    role: string;
    count: number;
    active: boolean;
}

export interface userForm {
    status: userStatus[];
}
