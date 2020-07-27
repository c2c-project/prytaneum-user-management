import express from 'express';
// import passport from 'passport';

const router = express.Router();

// router.use(passport.authenticate('jwt', { session: false }));

router.post('/update', (req, res) => {
    console.log('UNIMPLEMENTED');
    res.send('UNIMPLEMENTED');
});

router.delete('/delete', (req, res) => {
    console.log('UNIMPLEMENTED');
    res.send('UNIMPLEMENTED');
});

export default router;
