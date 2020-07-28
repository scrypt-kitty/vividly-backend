const express = require('express');
const router = express.Router();

const Post = require('../../models/User').Post;
const PostContent = require('../../models/User').PostContent;
const User = require('../../models/User').User;

// @route   GET api/posts
// @desc    Get Post by id
// @access  Public
router.get('/:id', (req, res) => {   
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err => res.status(404).json({success: false}));

}); 

// @route   GET api/posts
// @desc    Get All Posts
// @access  Public
router.get('/', (req, res) => {
    Post.find()
        .sort({ updatedTime: -1})
        .then(posts => res.json(posts));

}); 

// @route   POST api/posts
// @desc    Create a Post
// @access  Public
router.post('/', (req, res) => {

    User.findById(req.body.authorId)
        .catch(err => res.status(404).json({success: false, msg: "user not found"}));

    const newContentBlocks = req.body.content.map(c => new PostContent({
        postType: c.postType,
        content: c.content
    }));

    const newPost = new Post({
        content: newContentBlocks,
        authorId: req.body.authorId
    }); 


    newPost.save().then(post => res.json(post))
            .catch(err => res.status(500).json({success: false, msg: err}));
});

// @route   DELETE api/posts
// @desc    Delete a Post by id
// @access  Public
router.delete('/:id', (req, res) => {
    Post.findById(req.params.id)
        .then(post => post.remove().then(() => res.json({ success: true })))
        .catch(err => res.status(404).json({success: false}));
});

module.exports = router;
