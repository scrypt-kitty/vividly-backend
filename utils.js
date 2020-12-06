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

function isPasswordValid(password) {
	// TODO: add more checks
	return password.length > 7;
}

module.exports = {
	makeIdFriendly,
	isNameValid,
	stripNewlines,
	isPasswordValid
};