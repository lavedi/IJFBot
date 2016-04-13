/////////////////////////////////////////
// IJFBot - Telegram Bot for International Journalism Festival

// Copyright (C) 2016  Tommaso Tani

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
/////////////////////////////////////////

// dependencies
// express
var _ = require('lomath');
var express = require('express');
var app = express();
// express middlewares
var morgan = require('morgan');
var ejs = require('ejs');
var bodyParser = require('body-parser');
var multer = require('multer');
var RequestCaching = require('node-request-caching/lib/request-caching');

// telegram bot
var bot = require(__dirname + '/bot.js');
var token = '12345678:xxxxxxxxxxx-xxxxxxxxxxxxxxxxx';
var webhookUrl = 'https://webhook.url/'
// var webhookUrl = 'https://89679c38.ngrok.io';
var bot1 = new bot(token, webhookUrl);


// engine to render HTML
app.engine('.html', ejs.__express);
app.set('view engine', 'html');
// set the port number
app.set('port', process.env.PORT || 8443);

// Mount middlewares defaulted for root: 
// log all HTTP calls for debugging
app.use(morgan('dev'));
// use resources for html: HTML, JS and CSS etc.
app.use(express.static(__dirname + '/views'));
// parse incoming formData into JSON
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(multer());


// route: concise way to group all HTTP methods for a path
app.route('/')
    .get(function(req, res) {
        // console.log("you GET")
        res.render('index')
    })
    .post(function(req, res) {
        // send back to end req-res cycle
        res.json('okay, received\n');
        // robot handle as middleware for POST
        bot1.handle(req, res)
    })
    .put(function(req, res) {
        res.send("you just called PUT\n")
    })

// finally, listen to the specific port for any calls
app.listen(app.get('port'), function() {
    console.log('Node app is running on port', app.get('port'));
});
