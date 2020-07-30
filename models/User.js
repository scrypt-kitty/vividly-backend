const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    profilePicture: {
        type: String,
        default: 'https://peachedstorage.blob.core.windows.net/profilepics/default.png'
    },
    bio: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        required: true
    },
    friends: [String]
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
    commentCount: {
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
    }
});

module.exports = {
    User: mongoose.model('user', UserSchema),
};