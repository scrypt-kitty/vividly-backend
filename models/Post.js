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

// Duplicate the ID field.
CommentSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
CommentSchema.set('toJSON', {
    virtuals: true
});

// Ensure virtual fields are serialised.
CommentSchema.set('toObject', {
    virtuals: true
});

const PostContentSchema = new Schema({
    index: {
        type: Number,
        required: true
    },
    postType: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
});

// Duplicate the ID field.
PostContentSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
PostContentSchema.set('toJSON', {
    virtuals: true
});

// Ensure virtual fields are serialised.
PostContentSchema.set('toObject', {
    virtuals: true
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

// Duplicate the ID field.
PostSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
PostSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { delete ret._id }
});

// Ensure virtual fields are serialised.
PostSchema.set('toObject', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { delete ret._id }
});

module.exports = {
    Post: mongoose.model('post', PostSchema),
    PostContent: mongoose.model('postcontent', PostContentSchema),
    Comment: mongoose.model('comment', CommentSchema)
};
