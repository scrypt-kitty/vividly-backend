const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');

const Post = require('../../models/Post').Post;
const PostContent = require('../../models/Post').PostContent;


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
router.get('/:id', authMiddleware, async (req, res) => {
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
        res.status(500).json({ msg: 'error in getting post' })
    }
});


// @route   POST v0/posts
// @desc    Create a Post
// @access  Private
router.post('/', authMiddleware, async (req, res) => {
    try {
        const newContentBlocks = req.body.content.map(c => (new PostContent({
            postType: c.postType,
            content: c.content
        })));
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
router.patch('/:id', authMiddleware, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).select('authorId content updatedTime isUpdated');
        if (!post)
            return res.status(404).json({ success: false });

        const authorId = await post.authorId;
        if (req.user.id !== authorId)
            return res.status(401).json({ success: false });

        const newContentBlocks = req.body.content.map(c => (new PostContent({
            postType: c.postType,
            content: c.content
        })));

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
router.delete('/:id', authMiddleware, async (req, res) => {
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


module.exports = router;
