const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');

const User = require('../../models/User').User;

// @route   POST v0/account/update_profile
// @desc    Change basic profile info (bio, name, pfp -- in progress)
// @access  Private
router.post('/update_profile', authMiddleware, async (req, res) => {
    const newProfileInfo = {};

    if (req.body.name)
        newProfileInfo.name = req.body.name;

    if (req.body.bio)
        newProfileInfo.bio = req.body.bio;

    try {
        await User.updateOne({ id: req.user.id }, newProfileInfo);
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ msg: 'could not update profile information' });
    }

});

// @route   GET v0/accounts/username_available
// @desc    Check if username is available
// @access  Private
router.get('/username_available/:username', authMiddleware, async (req, res) => {

    try {

        const usernameCheck = await User.findOne({ username: req.params.username });
        if (!usernameCheck)
            return res.json({ success: true });
        return res.status(400).json({ success: false, msg: 'username unavailable' });

    } catch (e) {
        res.status(500).json({ msg: 'could not get username availability' });
    }

});

// @route   POST v0/account/username
// @desc    Change account username
// @access  Private
router.post('/username', authMiddleware, async (req, res) => {

    try {

        const usernameCheck = await User.findOne({ username: req.params.username });
        if (usernameCheck)
            return req.status(400).json({ success: false, msg: 'username unavailable' });

        await User.findOneAndUpdate({ id: req.user.id }, { username: req.body.username });

        return req.json({ success: true });

    } catch (e) {
        res.status(500).json({ msg: 'could not get username availability' });
    }

});

module.exports = router;
