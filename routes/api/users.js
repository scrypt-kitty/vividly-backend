const express = require('express');
const router = express.Router();

const User = require('../../models/User').User;

// @route   GET api/users
// @desc    Get User by id
// @access  Public
router.get('/:id', (req, res) => {
    User.findById(req.params.id)
        .then(user => res.json(user))
        .catch(err => res.status(404).json({success: false}));

}); 

// @route   GET api/users
// @desc    Get all Users
// @access  Public
router.get('/', (req, res) => {
    User.find()
        .sort({ username: -1})
        .then(users => res.json(users));

}); 

// @route   POST api/users
// @desc    Create a User
// @access  Public
router.post('/', (req, res) => {
    const newUser = new User({
        name: req.body.name,
        username: req.body.username,
        bio: req.body.bio
    }); 

    newUser.save().then(user => res.json(user));
});

// @route   DELETE api/users
// @desc    Delete a User by id
// @access  Public
router.delete('/:id', (req, res) => {
    User.findById(req.params.id)
        .then(user => user.remove().then(() => res.json({ success: true })))
        .catch(err => res.status(404).json({success: false}));
});

module.exports = router; // non-es6 way to export