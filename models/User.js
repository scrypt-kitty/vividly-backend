const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const config = require('config');
const BUCKET_NAME = process.env.BUCKET_NAME;

const FriendSchema = new Schema({
	friendType: {
        type: String,
        enum : ['pending','outgoing', 'friends'],
		default: 'outgoing'
	},
	friendId: {
		type: String,
		required: true
    },
    isFavorite: {
        type: Boolean,
        default: false,
    },
    lastReadPostTime: {
        type: Schema.Types.Mixed,
        default: null
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
    email : {
        type: String,
        required: true,
        unique: true
    },
    emailVerified: {
        type: Boolean,
        default: false
    },
    profilePicture: {
        type: String,
        default: `https://${BUCKET_NAME}.s3.amazonaws.com/defaults/peach-pfp.jpg`
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

// Duplicate the ID field.
UserSchema.virtual('id').get(function(){
    return this._id.toHexString();
});

// Ensure virtual fields are serialised.
UserSchema.set('toJSON', {
    virtuals: true
});

// Ensure virtual fields are serialised.
UserSchema.set('toObject', {
    virtuals: true
});

module.exports = {
    User: mongoose.model('user', UserSchema),
    Friend: mongoose.model('friend', FriendSchema)
};