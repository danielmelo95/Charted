var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var request = require('request');
var cheerio = require('cheerio');
var schedule = require('node-schedule');
var MongoClient = require('mongodb').MongoClient;
app.use(bodyParser.json());
app.use(express.static(__dirname + '/client'));
var async = require('asyncawait/async');
var await = require('asyncawait/await');

//mongoose.connect('mongodb://localhost/todolist');
var db = mongoose.connection;

// LOGGER
// --------------------------------------------------------------------------------------------

const winston = require('winston');
const fs = require('fs');
const env = process.env.NODE_ENV || 'development';
const logDir = 'log';
// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
	fs.mkdirSync(logDir);
}
const tsFormat = () => (new Date()).toLocaleTimeString();
date = new Date();
const logger = new (winston.Logger)({
	transports: [
		// colorize the output to the console
		new (winston.transports.Console)({
			timestamp: tsFormat,
			colorize: true,
			level: 'info'
		}),
		new (winston.transports.File)({
			filename: `${logDir}/${date.toDateString()}.log`,
			timestamp: tsFormat,
			level: env === 'development' ? 'debug' : 'info'
		})
	]
});

app.get('/logger', function (req, res) {
	clientIP = getClientIP(req);
	logger.info('Got a connection from IP address' + clientIP + ' to send logger');
	res.send("thanks for the ping :)");
	if (clientIP == "63.143.42.250") {
		var nodemailer = require('nodemailer');
		var transporter = nodemailer.createTransport({
			service: 'Gmail',
			auth: {
				user: 'charted.logger@gmail.com',
				pass: 'heslo123ahoj50'
			}
		});

		filePath = `./log/${date.toDateString()}.log`;
		var mailer = require('nodemailer');
		mailer.SMTP = {
			host: 'host.com',
			port: 587,
			use_authentication: true,
			user: 'charted.logger@gmail.com',
			pass: 'heslo123ahoj50'
		};
		fs.readFile(filePath, function (err, data) {
			transporter.sendMail({
				from: 'charted.logger@gmail.com',
				to: 'charted.logger@gmail.com',
				subject: 'hello world!',
				text: 'hello world!',
				attachments: [{ 'filename': `${date.toDateString()}.log`, 'content': data }]
			});
		});

		fs.unlink(filePath, function (error) {
			if (error) {
				throw error;
			}
			logger.info('Successfuly deleted ' + filePath);
		});
	}
});
// --------------------------------------------------------------------------------------------

logger.info("Starting application");

// DB SETUP
MONGOLAB_URI = "mongodb://admin:heslo123ahoj50@ds131137.mlab.com:31137/charted";

logger.info("Initializing connection to MongoDB");
mongoose.connect(MONGOLAB_URI, { useMongoClient: true }, function (error) {
	if (error) console.error(error);
	else logger.info("Successfuly connected to MongoDB");
});

// SCHEDULER
// --------------------------------------------------------------------------------------------
var rule = new schedule.RecurrenceRule();
rule.minute = 1;

app.get('/scrapper', function (req, res) {

	clientIP = getClientIP(req);
	logger.info('Got a connection from IP address' + clientIP + ' to scrape websites and save them to DB');
	res.send("thanks for the ping :)");
	if (clientIP == "63.143.42.250") {
		//var j = schedule.scheduleJob(rule, function () {

		// WEB PAGES SCRAPING
		// --------------------------------------------------------------------------------------------
		// Billboard
		logger.info("Web scrapping initialized")
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
					db.collection("billboards").drop();
				}

				(async(function asyncCall() {
					$('.chart-row__title').each(function () {
						author = $(this).find('.chart-row__artist').first().text();
						author = author.replace(/(\r\n|\n|\r)/gm, "");
						title = $(this).find('.chart-row__song').first().text();
						logger.info('calling');
						var result = await(searchYoutube(title, author, function (data) {
							data = (JSON.parse('{\n\t"id": "' + counter + '",\n\t"title": "' + title + '",\n\t"author": "' + author + '",\n\t"url": "' + data.items[0].id.videoId + '"\n}'));
							logger.info(data);
							db.collection("billboards").insertOne(data, function (err, res) {
								if (err) throw err;
								logger.info("1 document inserted to billboards collection");
							});
						}));

						logger.info(result);
						logger.info("______________________________________________");
						counter++;
					})
				}))();
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
							obj.table.push(JSON.parse('{\n\t"id": "' + counter + '",\n\t"title": "' + title + '",\n\t"author": "' + author + '"\n}'));
						}
						counter++;
					})
				}
				if (obj.table.length > 0) {
					logger.info(url + " successfuly scraped.")
					// delete collection 
					db.collection("officialcharts").drop();
					logger.info("collection officialcharts deleted");

					// add new songs to the collection
					db.collection("officialcharts").insertMany(obj.table, function (err, r) {
						logger.info("inserted songs to collection officialcharts");
					});
				}
				else {
					logger.infog(url + " is not responding");
				}
			})
		}
		// --------------------------------------------------------------------------------------------
	}
})

// --------------------------------------------------------------------------------------------

// WORKING WITH YOUTUBE API
// --------------------------------------------------------------------------------------------
var google = require('googleapis');
var youtube = google.youtube({
	version: 'v3',
	auth: "AIzaSyBpyV7rACEbUcnbyzKNhq85tc9kEKeNZiY"
});

function searchYoutube(title, author, fn) {

	youtube.search.list({
		part: 'id, snippet',
		q: title + " " + author,
		maxResults: "1",
	}, function (err, data) {
		if (err) {
			console.error('Error: ' + err);
		}
		if (data) {
			fn(data);
		}
	});
	return new Promise(resolve => {
		setTimeout(() => {
			resolve('resolved');
		}, 1000);
	});
}

// --------------------------------------------------------------------------------------------

// SERVER API WORKING WITH DATABASE
// --------------------------------------------------------------------------------------------

var db = mongoose.connection;

Billboard = require('./models/billboard.js');

// display all songs of billboard
app.get('/api/billboards', function (req, res) {
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

function getClientIP(req) {
	return req.headers['x-forwarded-for'] || req.connection.remoteAddress;
}
// calling server to listen on port
var server = app.listen(process.env.PORT || 98, function () {
	var host = server.address().address;
	var port = server.address().port;
	logger.info("App listening at http://%s:%s", host, port);
})
// --------------------------------------------------------------------------------------------
