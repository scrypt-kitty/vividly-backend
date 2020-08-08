const config = require('config');
const jwt = require('jsonwebtoken');

const User = require('../models/User').User;

function auth(req, res, next) {
	const token = req.header('x-auth-token');

	if (!token)
		return res.status(401).json({ msg: 'access denied' });

	try {
		const decoded = jwt.verify(token, config.get('jwtSecret'));
		if (req.method === 'GET') {
			User.findById(decoded.id)
				.lean()
				.select('-password')
				.then(usr => {
					if (!usr)
						return res.status(400).json({ msg: 'invalid token' });

					req.user = decoded;
					next(); // call next piece of middleware
				});
		} else {
			User.findById(decoded.id)
				.select('-password')
				.then(usr => {
					if (!usr)
						return res.status(400).json({ msg: 'invalid token' });

					req.user = decoded;
					next(); // call next piece of middleware
				});
		}

	} catch (e) {
		res.status(400).json({ msg: 'invalid token' });
	}
}


module.exports = auth;