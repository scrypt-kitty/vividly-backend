const config = require('config');
const jwt = require('jsonwebtoken');

const User = require('../models/User').User;

function auth(req, res, next) {
	const token = req.header('x-auth-token');

	if (!token)
		return res.status(401).json({ msg: 'access denied' });

	try {
		const { id, passwordHash } = jwt.verify(token, process.env.PEACHED_JWT_SECRET);
		if (!id || !passwordHash) throw Error('incomplete token');
		if (req.method === 'GET') {
			User.findOne({ _id: id, password: passwordHash })
				.select('-password')
				.lean()
				.then(usr => {
					if (!usr)
						return res.status(400).json({ success: false, msg: 'invalid token 1' });
					req.user = usr;
					next(); // call next piece of middleware
				})
				.catch(error => res.status(400).json({ success: false, msg: 'invalid token 2' }));
		} else {
			User.findOne({ _id: id, password: passwordHash })
				.select('-password')
				.then(usr => {
					if (!usr)
						return res.status(400).json({ success: false, msg: 'invalid token 3' });

					req.user = usr;
					next(); // call next piece of middleware
				})
				.catch(error => res.status(400).json({ success: false, msg: 'invalid token 4' }));
		}

	} catch (e) {
		console.log('ok');
		res.status(400).json({ success: false, msg: 'invalid token' });
	}
}


module.exports = auth;