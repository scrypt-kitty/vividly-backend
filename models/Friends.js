const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const FriendSchema = new Schema({
	friendType: {
		type: String,
		required: true
	},
	friendId: {
		type: String,
		required: true
	}
})


const FriendsSchema = new Schema({
	userId: {
		type: String,
		required: true,
	},
	friendIds: [FriendSchema]
});


module.exports = Friends = mongoose.model('friends', FriendsSchema)
