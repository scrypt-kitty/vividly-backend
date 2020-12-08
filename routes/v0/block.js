const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const User = require('../../models/User').User;

// @route   GET v0/block
// @desc    Get blocked users list
// @access  Private
router.get('/', auth, async (req, res) => {
    // TODO: return more info about each blocked user
    const user = req.user;
    res.status(200).json({ success: true, blockedUsers: user.blockedUserIds });
});

// @route   POST v0/block
// @desc    Add user to blocked user list and remove them from friends list
// @access  Private
router.post('/', auth, async (req, res) => {
    const user = req.user;
    const userId = req.body.userId;

    if (!userId) return res.status(400).json({ success: false, msg: 'missing user id' });
    try {
        if (userId.length !== 24)
            return res.status(400).json({ success: false, msg: 'invalid user id' });

        const blockedUser = await User.findById(userId);
        if (!blockedUser || blockedUser.isDeactivated)
            return res.status(400).json({ success: false, msg: 'cannot block this user' });

        if (user.blockedUserIds.includes(userId))
            return res.status(400).json({ success: false, msg: 'user is already on blocked users list' });

        user.blockedUserIds.push(userId);
        user.friends = user.friends.filter(friend => friend.friendId !== userId);
        await user.save();

        blockedUser.friends = blockedUser.friends.filter(friend => friend.friendId !== user.id);
        await blockedUser.save();

        return res.status(200).json({ success: true });

    } catch (e) {
        console.log(e);
        return res.status(500).json({ success: false, msg: 'cant add to blocked users list at this time' });
    }
});

// @route   DELETE v0/block
// @desc    remove user from blocked users list
// @access  Private
router.delete('/', auth, async (req, res) => {
    const user = req.user;
    const userId = req.body.userId;
    try {
        if (!user.blockedUserIds.includes(userId))
            return res.status(400).json({ success: false, msg: 'user cannot be unblocked if they are not on blocked list' });

        user.blockedUserIds = user.blockedUserIds.filter(id => id !== userId);

        await user.save();
        return res.status(200).json({ success: true });

    } catch (e) {
        return res.status(500).json({ success: false, msg: 'cant unblock user at this time' });
    }
});

module.exports = router;