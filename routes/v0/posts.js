const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

const { Post, PostContent, Comment } = require('../../models/Post');
const { User } = require('../../models/User');


// // make sure a user is post creator or friends w post creator
function canInteractWithPost(userId, authorId, friendsList) {
	if (userId === authorId)
		return true;

	const friendsFiltered = friendsList.filter(f => (f.friendType === 'friends' && f.friendId === authorId));
	return friendsFiltered.length > 0;
}


// @route   GET v0/posts
// @desc    Get Post by id
// @access  Private
router.get('/:id', auth, async (req, res) => {
	try {
		const user = req.user;
		const post = await Post.findById(req.params.id).lean(); // lean() returns plain js object, not doc
		if (!post)
			return res.status(404).json({ success: false });

		const authorId = await post.authorId;

		if (!canInteractWithPost(user.id, authorId, user.friends))
			return res.status(401).json({ success: false });

		res.json({ succcess: true, post });
	} catch (e) {
		res.status(500).json({ msg: 'error in getting post' });
	}
});


// @route   POST v0/posts/id/like
// @desc    Like Post by id
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
	try {
		const user = req.user;
		const post = await Post.findById(req.params.id).select('authorId likedBy');
		if (!post)
			return res.status(404).json({ success: false });

		const authorId = await post.authorId;

		if (!canInteractWithPost(user.id, authorId, user.friends))
			return res.status(401).json({ success: false });

		if (post.likedBy.filter(l => l === user.id).length < 1)
			post.likedBy.push(user.id);

		await post.save();

		res.json({ succcess: true, likedBy: post.likedBy });
	} catch (e) {
		res.status(500).json({ msg: 'error liking post' });
	}
});


// @route   POST v0/posts/id/unlike
// @desc    Unlike Post by id
// @access  Private
router.post('/:id/unlike', auth, async (req, res) => {
	try {
		const user = req.user;
		const post = await Post.findById(req.params.id).select('authorId likedBy');
		if (!post)
			return res.status(404).json({ success: false });

		const authorId = await post.authorId;

		if (!canInteractWithPost(user.id, authorId, user.friends))
			return res.status(401).json({ success: false });

		post.likedBy = post.likedBy.filter(l => l !== user.id);

		await post.save();

		res.json({ succcess: true, likedBy: post.likedBy });
	} catch (e) {
		res.status(500).json({ msg: 'error unliking post' });
	}
});


// @route   POST v0/posts
// @desc    Create a Post
// @access  Private
router.post('/', auth, async (req, res) => {
	try {
		let contentIndex = -1;
		const newContentBlocks = req.body.content.map(c => {
			contentIndex++;
			return new PostContent({
				index: contentIndex,
				postType: c.postType,
				content: c.content
			});

		});
		const newPost = new Post({
			content: newContentBlocks,
			authorId: req.user.id,
		});

		await newPost.save();
		res.json({ success: true, newPost });

	} catch (e) {
		res.status(500).json({ success: false, msg: 'cant create a new post at this time' });
	}

});


// @route   PATCH v0/posts
// @desc    Update post contents by id
// @access  Private
router.patch('/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id).select('authorId content updatedTime isUpdated');
		if (!post)
			return res.status(404).json({ success: false });

		const authorId = await post.authorId;
		if (req.user.id !== authorId)
			return res.status(401).json({ success: false });
		let contentIndex = -1;

		const newContentBlocks = req.body.content.map(c => {
			contentIndex++;
			return new PostContent({
				index: contentIndex,
				postType: c.postType,
				content: c.content
			});
		});

		post.content = newContentBlocks;
		post.updatedTime = Date.now();
		post.isUpdated = true;

		await post.save();

		return res.json({ success: true, post });

	} catch (e) {
		res.status(500).json({ success: false });
	}
});


// @route   DELETE v0/posts
// @desc    Delete a Post by id
// @access  Private
router.delete('/:id', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.id).select('authorId');
		const authorId = await post.authorId;
		if (req.user.id !== authorId)
			return res.status(401).json({ success: false });
		await post.remove();
		return res.json({ success: true });

	} catch (e) {
		res.status(500).json({ success: false });
	}
});


/** comments **/

// @route   POST v0/posts/:postId/comments
// @desc    Add a comment to a post
// @access  Private
router.post('/:postId/comments', auth, async (req, res) => {
	try {
		const user = req.user;
		const post = await Post.findById(req.params.postId).select('authorId comments');
		if (!post)
			return res.status(404).json({ success: false });

		const authorId = await post.authorId;

		if (!canInteractWithPost(user.id, authorId, user.friends))
			return res.status(401).json({ success: false });

		const comments = await post.comments;

		if (req.body.replyToId) {
			if (comments.filter(c => c.id === req.body.replyToId).length < 1)
				return res.status(400).json({ msg: 'invalid comment response' });
		}

		const newComment = new Comment({
			authorId: user.id,
			content: req.body.content,
		});

		if (req.body.replyToId) {
			post.comments = post.comments.map(c => {
				if (c.id === req.body.replyToId)
					c.replies.push(newComment);
				return c;
			});
		} else {
			comments.push(newComment);
		}

		post.save();

		res.json({ succcess: true, newComment });
	} catch (e) {
		res.status(500).json({ msg: 'error in replying to  post' });
	}
});


// @route   DELETE v0/:postId/comments/:commentId
// @desc    Delete a Comment by id
// @access  Private
router.delete('/:postId/comments/:commentId', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.postId);
		if (!post)
			return res.status(404).json({ success: false });

		if (post.comments.length < 1)
			return res.status(404).json({ success: false });

		if (req.body.isReply) {
			post.comments = post.comments.map(c => {
				c.replies = c.replies.filter(cr => (cr.authorId === req.user.id && cr.id === req.params.commentId));
				return c;
			})
		} else {
			// deletes all child replies too
			post.comments = post.comments.filter(c => (c.id === req.params.commentId && c.authorId === req.user.id));
		}

		await post.save();
		return res.json({ success: true });

	} catch (e) {
		res.status(500).json({ success: false });
	}
});


// @route   Get v0/:postId/comments
// @desc    Get comments for a post
// @access  Private
router.get('/:postId/comments', auth, async (req, res) => {
	try {
		const post = await Post.findById(req.params.postId).select('comments authorId').lean();
		if (!post)
			return res.status(404).json({ success: false });

		if (!canInteractWithPost(req.user.id, post.authorId, req.user.friends))
			return res.status(401).json({ succcess: false });

		const comments = await Promise.all(post.comments.map(async (comment) => {
			try {
				comment.author = await User.findById(comment.authorId).select('name username profilePicture bio').lean();
				comment.replies = await Promise.all(comment.replies.map(async (cr) => {
					try {
						cr.author = await User.findById(cr.authorId).select('name username profilePicture').lean();
						return cr;
					} catch (e) {
						return res.status(500).json({ succcess: false });
					}
				}));
				return comment;
			} catch (e) {
				return res.status(500).json({ succcess: false });
			}
		}));

		return res.json({ success: true, comments });

	} catch (e) {
		res.status(500).json({ success: false });
	}
});


module.exports = router;
