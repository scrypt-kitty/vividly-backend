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
	const newlineRegex = /\\n/g;
	return str.replace(newlineRegex, '');
}

function isPasswordValid(password) {
	// TODO: add more checks
	return password.length > 7;
}

function isUsernameValid(username) {
	const usernameRegex = /^[a-zA-Z0-9_]{4,15}$/;
	return usernameRegex.test(username);
}

module.exports = {
	makeIdFriendly,
	isNameValid,
	stripNewlines,
	isPasswordValid,
	isUsernameValid
};