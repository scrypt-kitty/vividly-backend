const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const config = require('config');
const jwt = require('jsonwebtoken');

const User = require('../../models/User').User;

// @route   POST auth
// @desc    Authenticate a User
// @access  Public
router.post('/', (req, res) => {
	const { username, password } = req.body;
	if (!username || !password) {
		return res.status(400).json({ msg: 'missing fields', succcess: false });
	}

	User.findOne({ username })
		.lean()
		.then(user => {
			if (!user) {
				return res.status(400).json({ msg: 'user with username does not exist', success: false });
			}

			bcrypt.compare(password, user.password)
				.then(isMatch => {
					if (!isMatch) return res.status(400).json({ msg: 'invalid credentials' });

					jwt.sign({
						id: user.id
					}, config.get('jwtSecret'), (err, token) => {
						if (err) throw err;
						const {
							id, name, username, email, emailVerified, profilePicture, bio, friends, blockedWords
						} = user;
						res.json({
							user: {
								id,
								name,
								username,
								email,
								emailVerified,
								profilePicture,
								bio,
								friends,
								blockedWords
							}, token
						});
					});
				});

		});

});


module.exports = router;
