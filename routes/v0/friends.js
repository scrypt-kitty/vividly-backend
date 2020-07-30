const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');

const User = require('../../models/User').User;

// @route   POST v0/friends/add
// @desc    Send a friend request
// @access  Public
router.post('/add', auth, (req, res) => {
	const { friendId } = req.body;
	const { userId } = req.user.id;

	// // make sure user to add exists
	User.findById(friendId)
	.then(friend => {
		if (!friend) return res.status(404).json({success: false})
;
		User.findById(userId)
			.then(user => {
				if (!user) return res.status(404).json({success: false});

				// already on friends list
				if (user.friends.indexOf(friendId) < 0)
				return res.status(400).json({success: false});



				

			})
	})
	.catch(err => res.status(404).json({success: false}));





});

// need to fix this :)
// @route   DELETE api/users
// @desc    Delete a User by id
// @access  Private
router.delete('/:id', auth, (req, res) => {
	User.findById(req.params.id)
		.then((user) =>
			user.remove().then(() =>
				Post.deleteMany({ authorId: req.params.id })
					.then(() => res.json({ success: true }))
					.catch((err) => console.log('hmm'))
			)
		)
		.catch((err) => res.status(404).json({ success: false }));
});

// todo: manual adding friends list
router.post('/create', auth, (req, res) => {
	// const newFriends = 
})


module.exports = router;