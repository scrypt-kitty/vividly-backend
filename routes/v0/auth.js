const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const config = require('config');
const jwt = require('jsonwebtoken');

const User = require('../../models/User').User;

// @route   POST auth/login
// @desc    Authenticate a User
// @access  Public
router.post('/login', async (req, res) => {
	const { username, password } = req.body;
	if (!username || !password) {
		return res.status(400).json({ msg: `missing fields`, succcess: false });
	}

	try {

		const user = await User.findOne({ username }).lean();

		if (!user)
			throw Error('user does not exist');

		const match = await bcrypt.compare(password, user.password);
		if (!match)
			throw Error('invalid credentials');

		const token = jwt.sign({
			id: user._id,
			passwordHash: password
		}, process.env.PEACHED_JWT_SECRET);

		if (!token)
			throw Error('couldnt sign token');


		const {
			name, email, emailVerified, profilePicture, bio, friends, blockedWords
		} = user;

		res.status(200).json({
			success: true,
			jwtToken: token,
			user: {
				id: user._id,
				name,
				email,
				username,
				bio,
				emailVerified,
				profilePicture,
				bio,
				friends,
				blockedWords
			}
		});


	} catch (e) {
		console.log(e);
		res.status(400).json({ success: false, msg: e });
	}

	/*

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
							},
							token
						});
					});
				});

		});
		*/

});


module.exports = router;
