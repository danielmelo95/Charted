var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;
app.use(bodyParser.json());
app.use(express.static(__dirname + '/client'));

// DB SETUP
MONGOLAB_URI = "mongodb://admin:heslo123ahoj50@ds131137.mlab.com:31137/charted";

mongoose.connect(MONGOLAB_URI, { useMongoClient: true }, function (error) {
	if (error) console.error(error);
	else console.log('mongo connected');
});

//mongoose.connect('mongodb://localhost/todolist');
var db = mongoose.connection;

// SCHEDULER
// --------------------------------------------------------------------------------------------
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var schedule = require('node-schedule');

var rule = new schedule.RecurrenceRule();
rule.minute = 1;

var j = schedule.scheduleJob(rule, function () {

	// WEB PAGES SCRAPING
	// --------------------------------------------------------------------------------------------
	// Billboard
	console.log("Starting scraping web sites");
	billboard();
	setTimeout(officialcharts, 3000);

	function billboard() {
		var obj = {
			table: []
		};
		url = 'https://www.billboard.com/charts/hot-100';
		request(url, function (error, response, html) {
			if (!error) {
				var $ = cheerio.load(html);
				var counter = 1;
				var title, release, rating;

				$('.chart-row__title').each(function () {
					author = $(this).find('.chart-row__artist').first().text();
					author = author.replace(/(\r\n|\n|\r)/gm, "");
					title = $(this).find('.chart-row__song').first().text();
					obj.table.push(JSON.parse('{\n\t"id": "' + counter + '",\n\t"title": "' + title + '",\n\t"author": "' + author + '"\n}'));
					counter++;
				})
			}
			if (obj.table.length > 0) {
				console.log(url + " successfuly scraped.")
				// delete collection 
				db.collection("billboard").drop();
				console.log("collection billboard deleted");

				// add new songs to the collection
				db.collection("billboard").insertMany(obj.table, function (err, r) {
					console.log("inserted songs to collection billboard");
				});
			}
			else {
				console.log(url + " is not responding");
			}
		})
	}

	// Officialcharts
	function officialcharts() {
		var obj = {
			table: []
		};
		url = 'http://www.officialcharts.com/chart-news/the-official-top-40-biggest-songs-of-2017-so-far__18652/';
		request(url, function (error, response, html) {
			if (!error) {
				var $ = cheerio.load(html);
				var counter = 0;
				var title, release, rating;
				var json = { id: "", title: "", author: "" };
				$('tbody').children().each(function () {
					if (counter != 0 && counter <= 40) {
						title = $(this).children().eq(1).text();
						author = $(this).children().eq(2).text();
						//console.log(title + " – " + author);
						obj.table.push(JSON.parse('{\n\t"id": "' + counter + '",\n\t"title": "' + title + '",\n\t"author": "' + author + '"\n}'));
					}
					counter++;
				})
			}
			//console.log(obj.table);
			if (obj.table.length > 0) {
				console.log(url + " successfuly scraped.")
				// delete collection 
				db.collection("officialcharts").drop();
				console.log("collection officialcharts deleted");

				// add new songs to the collection
				db.collection("officialcharts").insertMany(obj.table, function (err, r) {
					console.log("inserted songs to collection officialcharts");
				});
			}
			else {
				console.log(url + " is not responding");
			}
		})
	}
	// --------------------------------------------------------------------------------------------

});

// --------------------------------------------------------------------------------------------

// SERVER API WORKING WITH DATABASE
// --------------------------------------------------------------------------------------------
var db = mongoose.connection;
Billboard = require('./models/billboard.js');

var fs = require("fs");

// display all songs of billboard
app.get('/api/billboard', function (req, res) {
	Billboard.getAllSongs(function (err, allSongs) {
		if (err) {
			throw err;
		}
		res.json(allSongs);
	});
})

Officialcharts = require('./models/officialcharts.js');

// display all songs of officialcharts
app.get('/api/officialcharts', function (req, res) {
	Officialcharts.getAllSongs(function (err, allSongs) {
		if (err) {
			throw err;
		}
		res.json(allSongs);
	});
})

// calling server to listen on port
var server = app.listen(process.env.PORT || 98, function () {
	var host = server.address().address;
	var port = server.address().port;
	console.log("App listening at http://%s:%s", host, port);
})
// --------------------------------------------------------------------------------------------
