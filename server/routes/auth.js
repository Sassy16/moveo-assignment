const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const users = require('../data/users');
const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

router.post('/signup', async (req, res) =>{
    try {
        const { username, password, instrument, isVocal, isAdmin} = req.body;
        if (!username || !password){
            return res.status(400).json({error: 'Missing user name or password'});
        }

        if (users.find(u => u.username === username)){
            return res.status(400).json({error: 'Username already exists'});
        }

        const hash = await bcrypt.hash(password, 10);

        const newUser = {
            id: Date.now().toString(),
            username,
            passwordHash: hash,
            instrument: instrument || "vocals",
            isVocal: isVocal || false,
            isAdmin: isAdmin || false
        };

        users.push(newUser);
        console.log('new User', newUser.username);

        return res.json({ message: 'Singup successful' });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    try{
        const {username, password} = req.body;
        const user = users.find(u => u.username === username);
        if (!user) {
            return res.status(400).json({ error: 'Invalid user credentials' });
        }
        const match = await bcrypt.compare(password, user.passwordHash);
        if (!match) {
            return res.status(400).json({ error: 'Invalid user credentials' });
        }

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
                instrument: user.instrument,
                isVocal: user.isVocal,
                isAdmin: user.isAdmin,
            },
            JWT_SECRET,
            {expiresIn: "3h"}
        );
        
        res.json({token});
    }
    catch (err){
        console.error("login error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

module.exports = router;