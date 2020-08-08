const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middleware/auth');

const User = require('../../models/User').User;
const Friend = require('../../models/User').Friend;
const Post = require('../../models/Post').Post;

function otherUserExists(req, res, next) {
	if (!req.body.friendId) {
		next();
		return;
	}
	const newFriendId = req.body.friendId;
	User.findById(newFriendId)
		.select('-password')
		.then(friend => {
			if (!friend) return res.status(404).json({ msg: 'user not found' });
			next();
		}).catch(err => res.status(500).json({ msg: 'error getting other user' }));
}


// @route   POST v0/friends/add
// @desc    Send a friend request
// @access  Private
router.post('/add', [authMiddleware, otherUserExists], async (req, res) => {
	const friendId = req.body.friendId;
	const userId = req.user.id;
	try {

		// TODO: make friends :)
		const friend = await User.findById(friendId);
		const user = await User.findById(userId);

		const friendsList = await friend.friends;
		const usersList = await user.friends;

		const friendRequestInvalid = friendsList.filter(f => f.friendId === userId).length > 0 || usersList.filter(f => f.friendId === friendId).length > 0;

		if (friendRequestInvalid)
			return res.status(400).json({ msg: 'cant send friend request to this user' });

		const newFriendOutgoing = new Friend({
			friendType: 'outgoing',
			friendId: friendId
		});
		usersList.push(newFriendOutgoing);
		await user.save();

		const newFriendPending = new Friend({
			friendType: 'pending',
			friendId: userId
		});
		friendsList.push(newFriendPending);
		await friend.save();

	} catch (err) {
		console.log(err);
		return res.status(500).json({ msg: 'cannot add friend at this time' });
	}

	res.status(200).json({ success: true });
});


// @route   DELETE v0/friends/remove
// @desc    remove a friend
// @access  Private
router.delete('/remove/:id', [authMiddleware, otherUserExists], async (req, res) => {
	const friendId = req.params.id;
	const userId = req.user.id;

	try {
		let friend = await User.findById(friendId);
		let user = await User.findById(userId);

		const friendsList = await friend.friends;
		const usersList = await user.friends;

		const isRemoveRequestValid = friendsList.filter(f => f.friendId === userId).length > 0 && usersList.filter(f => f.friendId === friendId).length > 0;

		if (!isRemoveRequestValid)
			return res.status(400).json({ msg: 'invalid friend removal request' });

		friend.friends = friendsList.filter(f => f.friendId !== userId);
		user.friends = usersList.filter(f => f.friendId !== friendId);

		await friend.save();
		await user.save();

		return res.status(200).json({ success: true });

	} catch (err) {
		return res.status(500).json({ msg: 'cannot remove friend at this time' });
	}


});


// @route   GET v0/friends/pending/ids
// @desc    See incoming friend ids
// @access  Private
router.get('/pending/ids', authMiddleware, async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		const friendsList = await user.friends;
		res.status(200).json(friendsList.filter(f => f.friendType === 'pending'));
	} catch (err) {
		return res.status(500).json({ msg: 'cannot get list of pending friends' });
	}
});


// @route   GET v0/friends/pending
// @desc    See incoming friend info
// @access  Private
router.get('/pending', authMiddleware, async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		const pendingIds = await user.friends.filter(f => f.friendType === 'pending').map(f => f.friendId);
		const pendingUsers = await User.find().where('_id').in(pendingIds).select('profilePicture bio name username').exec();
		res.status(200).json(pendingUsers);

	} catch (err) {
		return res.status(500).json({ msg: 'cannot get list of pending friends' });
	}
});

// @route   POST v0/friends/pending/add
// @desc    accept pending friend request 
// @access  Private
router.post('/pending/add', authMiddleware, async (req, res) => {
	const friendId = req.body.friendId;
	const userId = req.user.id;

	try {
		let user = await User.findById(userId);
		let friend = await User.findById(friendId);

		const usersList = await user.friends;
		const friendsList = await friend.friends;

		const isFriendshipValid = usersList.filter(f => (f.friendId === friendId && f.friendType === 'pending')).length > 0 && friendsList.filter(f => (f.friendId === userId && f.friendType === 'outgoing')).length > 0;

		if (!isFriendshipValid)
			return res.status(400).json({ msg: 'invalid friendship request' });

		user.friends = usersList.map(f => {
			if (f.friendId === friendId)
				f.friendType = 'friends';
			return f;
		});
		friend.friends = friendsList.map(f => {
			if (f.friendId === userId)
				f.friendType = 'friends';
			return f;
		});

		await user.save();
		await friend.save();

		return res.status(200).json({ success: true });

	} catch (err) {
		return res.status(500).json({ msg: 'cannot accept friend request' });
	}

});


// @route   GET v0/friends/outgoing/ids
// @desc    See outgoing friend ids
// @access  Private
router.get('/outgoing/ids', authMiddleware, async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		const friendsList = await user.friends;
		res.status(200).json(friendsList.filter(f => f.friendType === 'outgoing'));
	} catch (err) {
		return res.status(500).json({ msg: 'cannot get list of outoing friend requests' });
	}
});


// @route   GET v0/friends/outgoing
// @desc    See outgoing friend info
// @access  Private
router.get('/outgoing', authMiddleware, async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		const outgoingIds = await user.friends.filter(f => f.friendType === 'outgoing').map(f => f.friendId);
		const outgoingUsers = await User.find().where('_id').in(outgoingIds).select('profilePicture bio name username').exec();
		res.status(200).json(outgoingUsers);

	} catch (err) {
		return res.status(500).json({ msg: 'cannot get list of pending friends' });
	}
});


// @route   GET v0/friends/list/ids
// @desc    See current friend ids
// @access  Private
router.get('/list/ids', authMiddleware, async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		const friendsList = await user.friends;
		res.status(200).json(friendsList.filter(f => f.friendType === 'friends'));
	} catch (err) {
		return res.status(500).json({ msg: 'cannot get list of friends' });
	}
});


// @route   GET v0/friends/list
// @desc    See current friends info
// @access  Private
router.get('/list', authMiddleware, async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		const friendIds = await user.friends.filter(f => f.friendType === 'friends').map(f => f.friendId);
		const friendsList = await User.find().where('_id').in(friendIds).select('profilePicture bio name username').exec();
		res.status(200).json(friendsList);

	} catch (err) {
		return res.status(500).json({ msg: 'cannot get list of pending friends' });
	}
});


// @route   GET v0/friends/feed
// @desc    Get most recent post of each friend
// @access  Private
router.get('/feed', authMiddleware, async (req, res) => {
	const user = req.user;
	const friends = user.friends.filter(f => f.friendType === 'friends');
	console.log(friends);
	const friendIds = friends.map(f => f.friendId);
	try {
		const friendsList = await User.find().where('_id').in(friendIds).select('profilePicture bio name username').lean().exec();

		const feed = await Promise.all(friendsList.map(async (friend) => {
			try {
				// get newest post
				const newestPost = await Post.findOne({ authorId: friend._id }).sort('-createdTime').lean().select('-comments');
				newestPost.content = newestPost.content[0];

				console.log(friends.filter(f => f.friendId === friend.id));
				console.log(friend.id);
				// // get number of unread posts
				// const lastReadPostTime = friends.filter(f => f.friendId === friend._id)[0].lastReadPostTime || null;
				let unreadPosts = 0;
				// console.log('unread posts');

				// if (lastReadPostTime) {
				// 	const curDate = Date.now();
				// 	unreadPosts = await Post.count({ createdTime: { $gt: curDate }});
				// }

				return { ...friend, newestPost, unreadPosts };
			} catch (e) {
				console.log(e);
				throw err;
			}
		}));

		res.status(200).json(feed);

	} catch (err) {
		return res.status(500).json({ msg: 'cannot get friend feed' });
	}
});


// @route   GET v0/friends/feed/userId/postIndex
// @desc    Get 15 most recent posts of a friend
// @access  Private
router.get('/feed/:friendId/:postIndex?', authMiddleware, async (req, res) => {
	const user = req.user;
	try {
		const friend = await User.findById(req.params.friendId).lean();
		if (!friend)
			return res.status(404).json({ success: false });

		const filteredFriends = user.friends.map(f => f.friendId === req.params.friendId && f.friendType === 'friends');
		if (filteredFriends.length < 1)
			return res.status(401).json({ success: false });

		// get 15 posts written by friend!
		const curDate = Date.now();
		const postIndexStart = req.params.postIndex || 0;
		const posts = await Post.find({ authorId: req.params.friendId, createdTime: { $lt: curDate } }).skip(postIndexStart).limit(15).lean();

		res.status(200).json(posts);

	} catch (err) {
		return res.status(500).json({ msg: 'cannot get list of pending friends' });
	}
});


// @route   GET v0/friends/feed/userId/markRead
// @desc    Mark feed as read
// @access  Private
router.get('/feed/:friendId/markread', authMiddleware, async (req, res) => {
	const user = req.user;
	try {
		const friend = await User.findById(req.params.friendId).select('id').lean();
		if (!friend)
			return res.status(404).json({ success: false });

		const filteredFriends = user.friends.map(f => f.friendId === req.params.friendId && f.friendType === 'friends');
		if (filteredFriends.length < 1)
			return res.status(401).json({ success: false });

		user.friends = user.friends.map(f => {
			if (f.friendId === req.params.friendId) {
				f.lastReadPostTime = Date.now();
			}
			return f;
		});

		await user.save();

		
		res.status(200).json({ success: true });

	} catch (err) {
		return res.status(500).json({ msg: 'cannot mark feed as read' });
	}
});


module.exports = router;