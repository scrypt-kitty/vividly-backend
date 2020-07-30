const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middleware/auth');

const User = require('../../models/User').User;

function otherUserExists(req, res, next) {
	const newFriendId = req.body.friendId;
	User.findById(newFriendId)
		.select('-password')
		.then(friend => {
			if (!friend) return res.status(404).json({ msg: 'user not found' });
			next();
		}).catch(err => res.status(500).json({msg: 'error getting other user'}));
}

// @route   POST v0/friends/add
// @desc    Send a friend request
// @access  Private
router.post('/add', [authMiddleware, otherUserExists], async (req, res) => {
	const friendId = req.body.friendId;
	const userId = req.user.id;

	// TODO: make friends :)

	const friend = await User.findById(friendId);
	const user = await User.findById(userId);

	if (!friend || !user) {
		return res.status(500).json({msg: 'unable to add friend'});
	}
	const friendsList = await friend.friends;
	const usersList = await user.friends;

	if (!friendsList || !usersList) {
		return res.status(500).json({msg: 'unable to add friend'});
	}
	const friendRequestInvalid = friendsList.filter(f => f.friendId === userId).length > 0 || usersList.filter(f => f.friendId === friendId).length > 0;

	if (friendRequestInvalid)
		return res.status(400).json({msg: 'cant send friend request to this user'});

	const newFriendOutgoing = new Friend({
		friendType: 'outgoing',
		friendId: friendId
	});
	usersList.push(newFriendOutgoing);
	const saveUserRes = await user.save();

	const newFriendPending = new Friend({
		friendType: 'pending',
		friendId: userId
	});
	friendsList.push(newFriendPending);
	const saveFriendRes = await friend.save();

	if (!saveUserRes || !saveFriendRes)
		return res.status(500).json({msg: 'unable to add friend'});

	res.status(200).json({success: true});
});


module.exports = router;