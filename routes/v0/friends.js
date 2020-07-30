const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middleware/auth');

const User = require('../../models/User').User;
const Friends = require('../../models/Friends');

function otherUserExists(req, res, next) {
	const newFriendId = req.body.friendId;
	User.findById(newFriendId)
		.select('-password')
		.then(friend => {
			if (!friend) return res.status(400).json({ msg: 'user not found' });
			req.friend = friend;
			next();
		}).catch(err => res.status(500).json({msg: 'error getting other user'}));
}

// @route   POST v0/friends/add
// @desc    Send a friend request
// @access  Private

router.post('/add', [authMiddleware, otherUserExists], (req, res) => {
	const friend = req.friend;
	const user = req.user;

	// TODO: make friends :)



	res.status(200).json({success: true});
});


// todo: manual adding friends list
router.post('/create', authMiddleware, (req, res) => {
	const newFriends = new Friends({
		userId: req.user.id
	});
	newFriends.save().then(newFriends => res.json(newFriends)).catch(err => res.json({ success: false, msg: err }));
})


module.exports = router;