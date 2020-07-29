const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');

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

// need to fix this
// @route   POST api/posts
// @desc    Create a Post
// @access  Private
router.post('/', auth, (req, res) => {

    User.findById(req.body.authorId)
        .catch(err => res.status(404).json({ success: false, msg: "user not found" }));


    const newContentBlocks = req.body.content.map(c => (new PostContent({
        postType: c.postType,
        content: c.content
    })));


    const newPost = new Post({
        // content: req.body.content,
        content: newContentBlocks,
        authorId: req.body.authorId,
    });


    newPost.save().then(post => res.json(post))
        .catch(err => res.status(500).json({ success: false, msg: err }));
});

// @route   DELETE api/posts
// @desc    Delete a Post by id
// @access  Private
router.delete('/:id', auth, (req, res) => {
    Post.findById(req.params.id)
        .then(post => post.remove().then(() => res.json({ success: true })))
        .catch(err => res.status(404).json({ success: false }));
});

module.exports = router;
