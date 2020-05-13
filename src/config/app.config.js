import cookieParser from 'cookie-parser';
import logger from 'morgan';
import express from 'express';
import passport from 'passport';
import './passport.config';

export default function (app) {
    // TODO: make this dev or prod mode
    app.use(logger('dev'));
    app.use(express.json());
    app.use(express.urlencoded({ extended: false })); // TODO: read more about this
    app.use(cookieParser());
    app.use(passport.initialize());
}
