const express = require('express');
const router = express.Router();
const uuid = require('uuid');
const config = require('config');
const AWS = require("aws-sdk");
const auth = require('../../middleware/auth');

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.BUCKET_NAME;

// @route   Get v0/upload/
// @desc    Upload an image file
// @access  Private
router.post('/', auth, async (req, res) => {
	const file = req.body.file;
	if (!file || !req.body) return res.status(400).json({ success: false, msg: 'missing file!' });
	const base64Data = new Buffer.from(file.replace(/^data:image\/\w+;base64,/, ""), 'base64');
	const imageType = file.split(';')[0].split('/')[1];
    const id = req.user.id;
    const filename = id + '-' + uuid.v4() + '.' + imageType;
	try {
		await s3.putObject({
			Bucket: BUCKET_NAME,
			Key: filename,
			Body: base64Data,
			ContentEncoding: 'base64',
			ContentType: `image/${imageType}`
		}, (err, data) => {
			if (err) throw (err);
			console.log(data);
		});
	} catch (e) {
		console.log(e);
		return res.status(500).json({ success: false, msg: 'failed to upload image...' });
    }
    const imageUrl = `https://${BUCKET_NAME}.s3.amazonaws.com/${filename}`;
	res.status(200).json({ success: true, imageUrl });
});

module.exports = router;