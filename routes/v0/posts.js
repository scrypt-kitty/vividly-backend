const express = require('express');
const router = express.Router();
const authMiddleware = require('../../middleware/auth');

const Post = require('../../models/Post').Post;
const PostContent = require('../../models/Post').PostContent;
const User = require('../../models/User').User;

// @route   GET api/posts
// @desc    Get Post by id
// @access  Public
router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err => res.status(404).json({ success: false }));

});

// @route   POST v0/posts
// @desc    Create a Post
// @access  Private
router.post('/', authMiddleware, (req, res) => {

    User.findById(req.user.id)
        .then(user => {
            if (!user)
                throw error;
            const newContentBlocks = req.body.content.map(c => (new PostContent({
                postType: c.postType,
                content: c.content
            })));


            const newPost = new Post({
                content: newContentBlocks,
                authorId: req.user.id,
            });


            newPost.save().then(post => res.json(post))
                .catch(err => res.status(500).json({ success: false, msg: err }));
        })
        .catch(err => res.status(404).json({ success: false, msg: "user not found" }));

});

// @route   DELETE api/posts
// @desc    Delete a Post by id
// @access  Private
router.delete('/:id', authMiddleware, (req, res) => {
    Post.findById(req.params.id)
        .then(post => post.remove().then(() => res.json({ success: true })))
        .catch(err => res.status(404).json({ success: false }));
});

/*
* testing only
*/

// @route   GET api/posts
// @desc    Get Post by id
// @access  Public
router.get('/', (req, res) => {
    Post.find()
        .then(posts => res.json(posts))
        .catch(err => res.status(404).json({ success: false }));

});

module.exports = router;
