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
const winston = require('winston');
const fs = require('fs');
const env = process.env.NODE_ENV || 'development';
const logDir = 'log';
//mongoose.connect('mongodb://localhost/todolist');
var db = mongoose.connection;

const tsFormat = () => (new Date()).toLocaleTimeString();
date = new Date();

logger = new (winston.Logger)({
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

logger.info("Starting application");

// DB SETUP
MONGOLAB_URI = process.env.MONGOLAB_URI;

logger.info("Initializing connection to MongoDB");
mongoose.connect(MONGOLAB_URI, { useMongoClient: true }, function (error) {
  if (error) console.error(error);
  else logger.info("Successfuly connected to MongoDB");
});

var test;

app.get('/scrapper', function (req, res) {

  clientIP = getClientIP(req);
  logger.info('Got a connection from IP address' + clientIP + ' to send logger');
  res.send("thanks for the ping :)");

  // LOGGER
  // --------------------------------------------------------------------------------------------

  // Create the log directory if it does not exist
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  const tsFormat = () => (new Date()).toLocaleTimeString();
  date = new Date();

  var nodemailer = require('nodemailer');
  var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.GMAIL_USERNAME,
      pass: process.env.GMAIL_PASSWORD
    }
  });

  filePath = `./log/${date.toDateString()}.log`;
  var mailer = require('nodemailer');
  mailer.SMTP = {
    host: 'host.com',
    port: 587,
    use_authentication: true,
    user: process.env.GMAIL_USERNAME,
    pass: process.env.GMAIL_PASSWORD
  };
  fs.readFile(filePath, function (err, data) {
    transporter.sendMail({
      from: process.env.GMAIL_USERNAME,
      to: process.env.GMAIL_USERNAME,
      subject: 'logs',
      text: 'logs',
      attachments: [{ 'filename': `${date.toDateString()}.log`, 'content': data }]
    });
  });
  logger.info("Successfuly deleted " + filePath);

  setTimeout(() => {
    fs.writeFile(filePath, "");
  }, 5000);
  // --------------------------------------------------------------------------------------------

  function getSongs(callback) {
    Billboard.getAllSongs(function (err, allSongs) {
      if (err) {
        throw err;
      }
      callback(allSongs);
    });
  }
  function one(result) {
    test = result;
    //console.log(test);
    return test;
    // Do anything you like
  }
  getSongs(function (result) { one(result); });


  // SCHEDULER
  // --------------------------------------------------------------------------------------------
  var rule = new schedule.RecurrenceRule();
  rule.minute = 1;

  clientIP = getClientIP(req);
  logger.info('Got a connection from IP address' + clientIP + ' to scrape websites and save them to DB');
  //res.send("thanks for the ping :)");
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
    }, 3000);
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
    console.log(allSongs[0].id);
    if (allSongs[0].id != 100) {
      logger.info("Had to load the old version of scrapped billboard website, because scrapping is now in progress");
      res.json(test);
    }
    else {
      res.json(allSongs);
    }
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
