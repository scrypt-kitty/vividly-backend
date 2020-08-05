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
    replyToId: {
        type: String,
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
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
})

const PostSchema = new Schema({
    updatedTime: {
        type: Date,
        default: Date.now
    },
    likeCount: {
        type: Number,
        default: 0
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
});

module.exports = {
    Post: mongoose.model('post', PostSchema),
    PostContent: mongoose.model('postcontent', PostContentSchema),
    Comment: mongoose.model('comment', CommentSchema)
};
