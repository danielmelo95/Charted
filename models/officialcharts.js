var mongoose = require('mongoose');

var schema = mongoose.Schema({
	title: {
		type: String,
		required: true
	},
	author: {
		type: String,
		required: true
	}
});

var Officialcharts = module.exports = mongoose.model('officialcharts', schema);

module.exports.getAllSongs = function (callback, limit) {
	Officialcharts.find(callback).limit(limit);
}
