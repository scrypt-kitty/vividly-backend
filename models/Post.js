const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    authorId: {
        type: String,
        required: true
    },
    createdTime: {
        type: Date,
        default: Date.now
    },
    replies: [] // same as CommentSchema but without replies
});

const PostContentSchema = new Schema({
    postType: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
});


const PostSchema = new Schema({
    updatedTime: {
        type: Date,
        default: Date.now
    },
    createdTime: {
        type: Date,
        default: Date.now
    },
    content: {
        type: [PostContentSchema],
        required: true
    },
    authorId: {
        type: String,
        required: true
    },
    isUpdated: {
        type: Boolean,
        default: false
    },
    comments: [CommentSchema],
    likedBy: [String]
});

module.exports = {
    Post: mongoose.model('post', PostSchema),
    PostContent: mongoose.model('postcontent', PostContentSchema),
    Comment: mongoose.model('comment', CommentSchema)
};
