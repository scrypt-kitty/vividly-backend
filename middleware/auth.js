const config = require('config');
const jwt = require('jsonwebtoken');

const User = require('../models/User').User;

function auth(req, res, next) {
    const token = req.header('x-auth-token');

    if (!token) {
        res.status(401).json({ msg: 'access denied' });
    }

    try {
        const decoded = jwt.verify(token, config.get('jwtSecret'));
        User.findById(decoded.id)
            .then(usr => {
                if (!usr) {
                    console.log("lol");
                    return res.status(400).json({ msg: 'invalid token' });
                }

                req.user = decoded;
                next(); // call next piece of middleware
            })
    } catch (e) {
        res.status(400).json({ msg: 'invalid token' });
    }
}

function requestingUserExists(req, res, next) {
    if (!req.user)
        return res.status(400).json({ msg: 'invalid token' });
    const userId = req.user.id;
    User.findById(userId)
        .select('-password')
        .then(usr => {
            if (!usr) return res.status(400).json({ msg: 'invalid token' });
            req.user = usr;
            next();
        }).catch(err => res.status(500).json({msg: 'error getting requesting user'}));
}

module.exports = authMiddleware = [auth, requestingUserExists];