const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');

const Post = require('../../models/Post').Post;
const Comment = require('../../models/Post').Comment;


// temporarily stolen from ./posts.js
// // make sure a user is post creator or friends w post creator
function canInteractWithPost(userId, authorId, friendsList) {
    if (userId === authorId)
        return true;

    const friendsFiltered = friendsList.filter(f => (f.friendType === 'friends' && f.friendId === authorId));
    return friendsFiltered.length > 0;
}


// @route   POST v0/comments/
// @desc    Add a comment to a post
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    try {
        const user = req.user;
        const post = await Post.findById(req.body.postId);
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
            replyToId: req.body.replyToId || null
        });

        comments.push(newComment);
        post.save();

        res.json({ succcess: true, newComment });
    } catch (e) {
        res.status(500).json({ msg: 'error in replying to  post' })
    }
});


// might need fixing
// @route   DELETE v0/comments
// @desc    Delete a Comment by id
// @access  Private
router.delete('/:postId/:commentId', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        if (!post)
            return res.status(404).json({ success: false });

        let comments = await post.comments;

        if (comments.length < 1)
            return res.status(404).json({ success: false });

        const filteredComments = comments.filter(c => c.id === req.params.commentId);

        if (filteredComments.length < 1)
            return res.status(404).json({ success: false });
        const theComment = filteredComments[0]

        if (theComment.authorId !== req.user.id)
            return res.status(401).json({ success: false });

        // if it's a top level comment, permanently delete if it has no replies
        if (!(theComment.replyToId)) {
            if (comments.filter(c => c.replyToId === theComment.id).length > 0) {
                theComment.isDeleted = true;
                theComment.authorId = '-1';
                theComment.content = '[deleted]';
                await post.save();
                return res.json({ success: true });
            }
        }

        post.comments = comments.filter(c => c.id !== req.params.commentId);

        await post.save();
        return res.json({ success: true });

    } catch (e) {
        res.status(500).json({ success: false });
    }
});


module.exports = router;