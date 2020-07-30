const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const FriendsSchema = new Schema({
	userId: {
		type: String,
		required: true,
	},
	friendIds: [String],
	pendingFriendIds: [String]
});


module.exports = Friends = mongoose.model('friends', FriendsSchema)
