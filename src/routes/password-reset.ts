import express from 'express';

const router = express.Router();

router.use((req, res) => {
    console.log('UNIMPLEMENTED');
    res.send('UNIMPLEMENTED');
});

router.post('/request', (req, res) => {
    console.log('UNIMPLEMENTED');
    res.send('UNIMPLEMENTED');
});

router.post('/consume', (req, res) => {
    console.log('UNIMPLEMENTED');
    res.send('UNIMPLEMENTED');
});

export default router;
