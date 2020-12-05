function makeIdFriendly(obj) {
	obj.id = obj._id;
	delete obj._id;
}

module.exports = {
    makeIdFriendly
};