require('dotenv').config()
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

logger = winston.createLogger({
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
console.log(process.env.MONGOLAB_URI)

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
  // logger.info("Successfuly deleted " + filePath);

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

  function removeWhiteSpace(string) {
    return string.replace(/(\r\n\t|\n|\r\t)/gm, "");
  }

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
        try {
          db.collection("billboards").drop();
        } catch (error) {
          console.log('Error while deleting collection billboards: ', error)
        }
      }

      (async(function asyncCall() {
        while (counter < 100) {
          if (counter === 1) {
            author = $('.chart-number-one__artist').first().text();
            console.log("author: ", author)
            author = author.replace(/(\r\n|\n|\r)/gm, "");
            title = $('.chart-number-one__title').first().text();
            title = title.replace(/(\r\n\t|\n|\r\t)/gm, "");
            logger.info('calling');
            data = (JSON.parse('{\n\t"id": "' + counter + '",\n\t"title": "' + title + '",\n\t"author": "' + author + '"\n}'));

            var result = await(searchYoutube(title, author, function (data) {
              console.log("author: ", author)
              console.log("title: ", title)
              console.log('{\n\t"id": "' + counter + '",\n\t"title": "' + title + '",\n\t"author": "' + author + '",\n\t"url": "' + data.items[0].id.videoId + '"\n}')
              data = (JSON.parse('{\n\t"id": "' + counter + '",\n\t"title": "' + title + '",\n\t"author": "' + author + '",\n\t"url": "' + data.items[0].id.videoId + '"\n}'));
              logger.info(data);
            }));

            db.collection("billboards").insertOne(data, function (err, res) {
              if (err) throw err;
              logger.info("1 document inserted to billboard collection");
            });
            logger.info(result);
            logger.info("______________________________________________");
            counter++;
          }
          else {
            $('.chart-list-item__text').each(function () {
              author = $(this).find('.chart-list-item__artist').first().text();
              console.log("author: ", author)
              author = removeWhiteSpace(author)
              title = $(this).find('.chart-list-item__title').first().text();
              title = removeWhiteSpace(title);
              logger.info('calling');
              data = (JSON.parse('{\n\t"id": "' + counter + '",\n\t"title": "' + title + '",\n\t"author": "' + author + '"\n}'));

              var result = await(searchYoutube(title, author, function (data) {
                console.log("author: ", author)
                console.log("title: ", title)
                console.log('{\n\t"id": "' + counter + '",\n\t"title": "' + title + '",\n\t"author": "' + author + '",\n\t"url": "' + data.items[0].id.videoId + '"\n}')
                data = (JSON.parse('{\n\t"id": "' + counter + '",\n\t"title": "' + title + '",\n\t"author": "' + author + '",\n\t"url": "' + data.items[0].id.videoId + '"\n}'));
                logger.info(data);
              }));

              db.collection("billboards").insertOne(data, function (err, res) {
                if (err) throw err;
                logger.info("1 document inserted to billboard collection");
              });
              logger.info(result);
              logger.info("______________________________________________");
              counter++;
            })
          }
        }
      }))();
    })
  }

  // Officialcharts
  function officialcharts() {
    var obj = {
      table: []
    };
    url = 'https://www.officialcharts.com/charts';
    request(url, function (error, response, html) {
      if (!error) {
        var $ = cheerio.load(html);
        var counter = 1;
        var title, release, rating;
        var json = { id: "", title: "", author: "" };
        $('.track').each(function () {
          if (counter <= 101) {
            title = $(this).find('.title').text();
            author = $(this).find('.artist').text();
            title = removeWhiteSpace(title)
            author = removeWhiteSpace(author)
            console.log('{\n\t"id": "' + counter + '",\n\t"title": "' + title + '",\n\t"author": "' + author + '"\n}')
            obj.table.push(JSON.parse('{\n\t"id": "' + counter + '",\n\t"title": "' + title + '",\n\t"author": "' + author + '"\n}'));
          }
          counter++;
        })
      }
      if (obj.table.length > 0) {
        logger.info(url + " successfuly scraped.")
        // delete collection 
        try {
          db.collection("officialcharts").drop();
        }
        catch(error) {
          console.log("Error while deleting collection officialcharts: ", error);
        }
        logger.info("collection officialcharts deleted");

        // add new songs to the collection
        db.collection("officialcharts").insertMany(obj.table, function (err, r) {
          logger.info("inserted songs to collection officialcharts");
        });
      }
      else {
        logger.info(url + " is not responding");
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
  auth: process.env.YOUTUBE_API
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
    console.log("allSongs", allSongs)
    if (err) {
      throw err;
    }
    if (allSongs.length > 0 && allSongs[0].id != 100) {
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
var server = app.listen(process.env.PORT || 3001, function () {
  var host = server.address().address;
  var port = server.address().port;
  logger.info("App listening at http://%s:%s", host, port);
})
// --------------------------------------------------------------------------------------------
