const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const config = require('config');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middleware/auth');

const User = require('../../models/User').User;

// @route   POST v0/users/register
// @desc    Register a new User
// @access  Public
router.post('/register', async (req, res) => {
    const { name, username, password, email } = req.body;
    if (!name || !username || !password || !email) {
        return res.status(400).json({ msg: 'missing fields', succcess: false });
    }

    try {

        const user = await User.findOne({ username }).lean();
        if (user)
            return res.status(400).json({ msg: 'user with username already exists', success: false });

        const userEmailCheck = await User.findOne({ email }).lean();
        if (userEmailCheck)
            return res.status(400).json({ msg: 'user with that email already exists', succcess: false })

        const newUser = new User({
            name,
            username,
            password,
            email
        });


        bcrypt.genSalt(10, (err, salt) => {
            bcrypt.hash(newUser.password, salt, (err, hash) => {


                const saveUser = async () => {
                    if (err) {
                        await newUser.remove();
                        return res.status(500).json({
                            msg: 'error creating new user',
                            success: false
                        })
                    }

                    newUser.password = hash;
                    await newUser.save();

                    jwt.sign({
                        id: newUser.id
                    }, config.get('jwtSecret'), (err, token) => {
                        if (err) throw err;

                        res.json({
                            user: {
                                id: newUser.id,
                                name: newUser.name,
                                username: newUser.username,
                                email: newUser.email

                            }, token
                        });


                    });
                }
                saveUser();
            });
        });

    } catch (e) {
        res.status(500).json({ succcess: false, msg: 'unable to create account at this time' });
    }

});


// @route   GET v0/users/lookup
// @desc    Lookup user by username
// @access  Private
router.get('/lookup/:username', authMiddleware, (req, res) => {
    User.findOne({ username: req.params.username })
        .select('name username profilePicture bio')
        .then(user => {
            if (!user)
                throw error;
            res.json(user)
        })
        .catch(err => res.status(404).json({ success: false }));
});


// need to fix this :)
// @route   DELETE v0/users
// @desc    Delete a User by id
// @access  Private
router.delete('/:id', authMiddleware, (req, res) => {
    User.findById(req.params.id)
        .then(user => user.remove().then(() => res.json({ success: true })).catch(err => console.log("hmm")))
        .catch(err => res.status(404).json({ success: false }));

});

module.exports = router;