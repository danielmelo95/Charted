var mongoose = require('mongoose');

var schema = mongoose.Schema({
	id: {
		type: Number,
		required: true
	},
	title: {
		type: String,
		required: true
	},
	author: {
		type: String,
		required: true
	},
}, { _id: false });


var Billboard = module.exports = mongoose.model('billboards', schema);

module.exports.getAllSongs = function (callback, limit) {
	// Billboard.find(callback).limit(limit);

	Billboard.find(callback).sort({ $natural: -1 }).limit(100);
}
