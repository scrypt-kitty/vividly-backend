const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FriendSchema = new Schema({
	friendType: {
        type: String,
        enum : ['pending','outgoing', 'friends'],
		default: 'outgoing'
	},
	friendId: {
		type: String,
		required: true
	}
});

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
    friends: [FriendSchema],
    blockedWords: [String],
});

module.exports = {
    User: mongoose.model('user', UserSchema),
    Friend: mongoose.model('friend', FriendSchema)
};