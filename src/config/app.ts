import cookieParser from 'cookie-parser';
import logger from 'morgan';
import express, { Express } from 'express';
import passport from 'passport';
import helmet from 'helmet';

import './passport'; // intializes passport using our configuration
import env from './env'; // initializes env vars using our configuration

export default function (app: Express): void {
    // TODO: make this dev or prod mode
    app.use(logger('dev'));
    app.use(helmet());
    app.use(express.json());
    app.use(express.urlencoded({ extended: false })); // TODO: read more about this
    app.use(cookieParser(env.COOKIE_SECRET));
    app.use(passport.initialize());
}
