const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const config = require('config');
const jwt = require('jsonwebtoken');
const auth = require('../../middleware/auth');

const { User } = require('../../models/User');
const { Post } = require('../../models/Post');

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
					}, process.env.PEACHED_JWT_SECRET, (err, token) => {
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
				};
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
router.get('/lookup/:username', auth, (req, res) => {
	User.findOne({ username: req.params.username })
		.select('name profilePicture bio')
		.then(user => {
			if (!user)
				throw 'error';
			res.json(user);
		})
		.catch(err => res.status(404).json({ success: false }));
});


// @route   DELETE v0/users
// @desc    Delete a users own account
// @access  Private
router.delete('/', auth, async (req, res) => {
	const user = req.user;
	try {

		// remove user from friends lists of other users
		const friends = user.friends;
		await Promise.all(friends.map(async (f) => {
			try {
				const friend = await User.findById(f.friendId).select('friends');
				const friendFriends = friend.friends;
				friend.friends = friendFriends.filter(ff => ff.friendId !== user.id);
				await friend.save();
			} catch (e) {}
		}));

		// remove all posts by user
		await Post.deleteMany({ authorId: user.id});

		await user.remove();
		return res.status(200).json({ succcess: true });
	} catch (e) {
		return res.status(500).json({ msg: 'cannot delete user at this time.'});
	}

});

// @route	GET v0/self
// @desc	Get user's basic info from jwt
// @access	Private
router.get('/self', auth, (req, res) => {
	try {
		const user = req.user;
		return res.status(200).json({ user, success: true });
	} catch (e) {
		return res.status(500).json({ msg: 'could not sign in' });
	}
});

module.exports = router;