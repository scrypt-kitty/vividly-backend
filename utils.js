function makeIdFriendly(obj) {
	obj.id = obj._id;
	delete obj._id;
}

function isNameValid(name) {
	// TODO: add more checks
	return name.length > 0 && name.length < 51;
}

function stripNewlines(str) {
	// there should be a better way to do this :)
	return str.replaceAll('\n', '');
}

module.exports = {
	makeIdFriendly,
	isNameValid,
	stripNewlines
};