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

        return res.json({ success: true });

    } catch (e) {
        res.status(500).json({ msg: 'could not get username availability' });
    }

});


// @route   POST v0/account/blocked_words
// @desc    Add to blocked words list
// @access  Private
router.post('/blocked_words', authMiddleware, async (req, res) => {

    try {
        const user = await User.findById(req.user.id);
        const blockedWords = await user.blockedWords;
        if (blockedWords.indexOf(req.body.new_word) > -1)
            return res.status(400).json({ msg: 'word already in blocked words list' });
        blockedWords.push(req.body.new_word);
        await user.save();

        return res.json({ success: true });

    } catch (e) {
        console.log(e);
        res.status(500).json({ msg: 'could not add to blocked words list' });
    }

});


// @route   DELETE v0/account/blocked_words
// @desc    Delete from blocked words list
// @access  Private
router.delete('/blocked_words', authMiddleware, async (req, res) => {

    try {
        const user = await User.findById(req.user.id);
        const blockedWords = await user.blockedWords;
        if (blockedWords.indexOf(req.body.word) < 0)
            return res.status(400).json({ msg: 'word not in blocked words list' });
        user.blockedWords = blockedWords.filter(w => w !== req.body.word);
        await user.save();

        return res.json({ success: true });

    } catch (e) {
        console.log(e);
        res.status(500).json({ msg: 'could not add to blocked words list' });
    }

});


// @route   GET v0/account/blocked_words
// @desc    See blocked words list
// @access  Private
router.get('/blocked_words', authMiddleware, async (req, res) => {

    try {
        const user = await User.findById(req.user.id);

        return res.json({ success: true, blocked_words: user.blockedWords });

    } catch (e) {
        res.status(500).json({ msg: 'could not get blocked words list' });
    }

});

module.exports = router;
