/////////////////////////////////////////
// Safety: Uncomment everything to use //
/////////////////////////////////////////

// dependencies
var _ = require('lomath');
var moment = require('moment');
var ua = require('universal-analytics');
var helpers = require('./helpers/helpers')
var services = require('./helpers/services')
var async = require('async')
var fs = require('fs')
// API as superclass that bot inherits methods from
var API = require(__dirname + '/API.js')
var visitor = ua('UA-XXXXXXX-X');
//image
//caching
var RequestCaching = require('node-request-caching/lib/request-caching');
var jsonQuery = require('json-query')
// The bot object prototype
// bot extends and inherits methods of API
var bot = function(token, webhookUrl) {
    API.apply(this, arguments);
    // set webhook on construction: override the old webhook
    this.setWebhook(webhookUrl || '');

}

// set prototype to API
bot.prototype = API.prototype;
// set constructor back to bot
bot.prototype.constructor = bot;


/**
 * Handles a Telegram Update object sent from the server. Extend this method for your bot.
 * 
 * @category Bot
 * @param {Object} req The incoming HTTP request.
 * @param {Object} res The HTTP response in return.
 * @returns {Promise} promise A promise returned from calling Telegram API method(s) for chaining.
 *
 * @example
 * var bot1 = new bot('yourtokenhere');
 * ...express server setup
 * app.route('/')
 * // robot API as middleware
 * .post(function(req, res) {
 *     bot1.handle(req, res)
 * })
 * // Then bot will handle the incoming Update from you, routed from Telegram!
 * 
 */

var session_request = []

bot.prototype.handle = function(req, res) {
    // the Telegram Update object. Useful shits
    var Update = req.body,
        // the telegram Message object
        Message = Update.message,
        // the user who sent it
        user_id = Message.from.id,
        // id of the chat(room)
        chat_id = Message.chat.id;

    ////////////////////////
    // Extend from here:  //
    ////////////////////////
    // you may call the methods from API.js, which are all inherited by this bot class


     switch (helpers.messageType(req)) {

        case 'text':

        if (helpers.isCommand(Message.text)) {
        
            var user_command = Message.text.split(' ')[0],
                user_parameter = Message.text.substring(user_command.length+1, Message.text.length);

             var d = new Date();
            var day = d.getDate();
            // day = 6; //DEBUG
            var hour = d.getHours()+2; //time zone correction
            var minutes = d.getMinutes();
            // hour = 18; //DEBUG
            // minutes = 10;
            var dateNow = "2016-04-" + day + " " + hour + ":" + minutes +":00"
            var now = moment(dateNow);
            console.log(dateNow);

            switch(user_command) {

                //
                // INFO ROUTE
                // 
                case '/start':
                case '/help':
                    this.sendMessage(chat_id, "Hi, I'm the official bot of the *International Journalism Festival*!\nI can help you enjoy IJF to the best of your possibilities.\n\nYou can ask me for info with these commands:\n\n/help show this message ;)\n/now show current events\n/locate _[place name]_ show directions for a festival venue (use just one word)\n/speaker _[speaker name]_ show events with this speaker", 'Markdown');
                    visitor.pageview("/help").send();
                break;
                // EASTER EGG
                // 
                case '/ditino':
                    var BOTTONE = this;
                    var random = Math.floor((Math.random() * 10) + 1);
                    if(random % 2 == 0){
                        // BOTTONE.sendMessage(chat_id, "http://i.giphy.com/OMKZfNdSPpXfa.gif", 'Markdown');
                        BOTTONE.sendDocument(chat_id, fs.createReadStream(__dirname + '/public/1.gif'))
                    } else {
                        BOTTONE.sendDocument(chat_id, fs.createReadStream(__dirname + '/public/2.gif'))
                    }
                break;
                //
                //LIST NEXT HOURS EVENT
                //
               case '/now':
               		var m = 0;
                    visitor.pageview("/now").send();
                    var BOTTONE = this;
                    BOTTONE.sendMessage(chat_id, "Current events:\n");
                    var rc = new RequestCaching();

                    rc.get("http://www.journalismfestival.com/mobile/ijf.xml", {}, 3600, 
                    function(err, res, body, cache) {
                        console.log('Response', res);         // response params object (options, headers, statusCode)
                        //console.log('Body', body);            // response body as string
                        console.log('Cache', cache);          // cache info object (hit, key)

                            var parseString = require('xml2js').parseString;
                            var xml = body;
                            parseString(xml, function (err, result) {
                                var eventi = result.eventi.evento;
                                // console.log(eventi[0]);
                                var minuteDisplay;
                                eventi.forEach(function(evento){
                                    var eventDateStart = moment(evento.date_start[0], "YYYY-MM-DD HH:mm:ss")
                                    var eventDateEnd = moment(evento.date_end[0], "YYYY-MM-DD HH:mm:ss")
                                   
                                    if(day == eventDateStart.date() && (eventDateStart.hours() - hour == 1) && minutes - eventDateStart.minutes() <= 15){
                                            var label = "🕐 ABOU TO START AT " + eventDateStart.hour() + ":" + eventDateStart.minutes() + " 🕐"
                                         BOTTONE.sendMessage(chat_id, label + "\n• \"" + evento.titolo[0] + "\", with " + evento.speakers[0] + " (at "+evento.location[0]+").\nMore info at: " + evento.url[0]);
                                         m++;
                                    }

                                    if(day == eventDateStart.date() && eventDateStart.hours() == hour && hour <= eventDateEnd.hours()){
                                         
                                         eventDateStart.minutes() == 0 ? minuteDisplay = '00' : minuteDisplay = eventDateStart.minutes()
                                         if(minutes - eventDateStart.minutes() > 0){
                                            var label = "🕐 STARTED AT " + eventDateStart.hour() + ":" + minuteDisplay + " 🕐"
                                         } else if(minutes - eventDateStart.minutes() < 0){
                                            var label = "🕐 ABOUT TO START AT " + eventDateStart.hour() + ":" + minuteDisplay + " 🕐"
                                         } else if(minutes - eventDateStart.minutes() == 0){
                                            var label = " 🕐 STARTING RIGHT NOW 🕐";
                                         }

                                         BOTTONE.sendMessage(chat_id, label + "\n*" + evento.titolo[0] + "*, with " + evento.speakers[0] + " (at "+evento.location[0]+").\n_More info at:_ " + evento.url[0], 'Markdown');
                                         m++;
                                    }
                                })
                                //console.log(now);
                                if (m == 0){
                                    setTimeout(function() {
                                        visitor.pageview("/now-no-event").send();
                                        BOTTONE.sendMessage(chat_id, "I'm so sorry, there are no events right now :(", 'Markdown');
                                    }, 2000);
                                }
                            });
                      })
                    
                break;

                //
                //FIND SPEAKER
                //
                case '/speaker':
                    visitor.pageview("/speaker").send();
                    var BOTTONE = this;
                    var speakerQuery = Message.text.slice(9);
                    if(speakerQuery.length < 2) {
                        BOTTONE.sendMessage(chat_id, "Please, write me a name to look for, I can't read your mind! 🙈\n");
                        visitor.pageview("/speaker-no-words").send();
                    } else {
                        BOTTONE.sendMessage(chat_id, "Here are events with "+speakerQuery+":\n");
                        var rc = new RequestCaching();
                        visitor.pageview("/speaker/"+speakerQuery).send();
                        rc.get("http://www.journalismfestival.com/mobile/ijf.xml", {}, 3600, 
                        function(err, res, body, cache) {
                            console.log('Response', res);         // response params object (options, headers, statusCode)
                            //console.log('Body', body);            // response body as string
                            console.log('Cache', cache);          // cache info object (hit, key)

                                var parseString = require('xml2js').parseString;
                                var xml = body;
                                parseString(xml, function (err, result) {
                                    var eventi = result.eventi;
                                    //console.log(eventi.evento);
                                    var m = 0;
                                    eventi.evento.forEach(function(evento){
                                      evento.speakers.forEach(function(speaker){
                                        var re = new RegExp(speakerQuery,"gi");
                                        
                                        if(speaker.match(re)){
                                            var minuteDisplay;
                                            var eventDateStart = moment(evento.date_start[0], "YYYY-MM-DD HH:mm:ss")
                                            var eventDateEnd = moment(evento.date_end[0], "YYYY-MM-DD HH:mm:ss")
                                            eventDateStart.minutes() == 0 ? minuteDisplay = '00' : minuteDisplay = eventDateStart.minutes()
                                            BOTTONE.sendMessage(chat_id, "\n*" + evento.titolo[0] + "*, with " + evento.speakers[0] + " (at "+evento.location[0]+").\n🗓 "+eventDateStart.date()+"/04/2016, h: "+eventDateStart.hour() + ":" + minuteDisplay+"\n\n_More info at:_ " + evento.url[0], 'Markdown');
                                            m++;
                                        }
                                      })
                                    })
                                    if(m==0){
                                            BOTTONE.sendMessage(chat_id, "I'm so sorry, no event found with _"+speakerQuery+"_ 😭\nTry again using *only one word* after the /speaker command or take a look at the speakers list http://www.journalismfestival.com/speaker-list/2016", 'Markdown')
                                    }
                                });
                          })    
                    }
                    
                break;

                //
                // LOCATE VENUE
                //
                case '/locate':
                    visitor.pageview("/locate").send();
                    var res;

                    var kb = {
                            keyboard: [],
                            one_time_keyboard: true,
                            resize_keyboard: true
                        }

                        venues.location.forEach(function(venue){
                            var temp = ["/locate "+venue.tag[0]]
                            kb.keyboard.push(temp);
                        })

                    var BOTTONE = this;
                    var venueQuery = Message.text.slice(8);

                    if(venueQuery != ""){
                        var string = 'location[name~/('+venueQuery+')/i]'
                        var res = jsonQuery(string, {data: venues, allowRegexp: true})

                        if(venueQuery.split(" ").length == 1 && res.value){
                            BOTTONE.sendMessage(chat_id, "Looking for "+res.value.name+"...")
                            BOTTONE.sendLocation(chat_id, res.value.lat, res.value.long);
                            visitor.pageview("/locate/"+res.value.name).send();
                        } else {
                            BOTTONE.sendMessage(chat_id, "❗️ No results! Please, try typing only one word after the /locate command to search for the venue or one of the following:", 'Markdown', undefined, undefined, kb)
                            visitor.pageview("/locate-no-results").send();
                        }
                    } else {
                        BOTTONE.sendMessage(chat_id, "Please, type one word after the /locate command to search for the venue 🔎\n\nExamples:", 'Markdown', undefined, undefined, kb)
                        visitor.pageview("/locate-no-words").send();
                    }
                    
                break;

                case '/food':
                     var BOTTONE = this;
                     session_request[chat_id] = "food"
                     console.log(session_request[chat_id]);
                     BOTTONE.sendMessage(chat_id, "Please send me your location!", 'Markdown');
                     visitor.pageview("/food").send();
                break;

                default:
                    var BOTTONE = this;
                    BOTTONE.sendMessage(chat_id, "Command not found, use /help for list of commands", 'Markdown');
                    visitor.pageview("/command-not-found").send();
            }
        } else {
            console.log("user NOT send command");
            
        }
        break;

        case 'location':
            var BOTTONE = this;
            if (session_request && session_request[chat_id] == "food") {
                visitor.pageview("/food-location").send();
                user_location = req.body.message.location.latitude + "," + req.body.message.location.longitude;
                // console.log(user_location);
                
                var start = {
                    latitude : req.body.message.location.latitude,
                    longitude : req.body.message.location.longitude
                }

                var restaurants = require('./db/restaurants.json')
                var results = [];
                var m = 0;

                BOTTONE.sendMessage(chat_id, 'Looking for restaurants near you...', 'Markdown');

                setTimeout(function() {
                    async.eachSeries(restaurants.restaurants, function (uno, callback) {
                      var stop = {
                            latitude: uno.lat,
                            longitude: uno.long
                      }
                      var d = helpers.getDistance(start, stop, 6);
                      if (d<=0.27) {
                        setTimeout(function() {
                            BOTTONE.sendMessage(chat_id, '*'+uno.name+'*\n'+uno.information+'\nDistance: _'+d+'km_', 'Markdown')
                            BOTTONE.sendLocation(chat_id, uno.lat, uno.long);
                        }, 1000);
                         m++;
                         visitor.pageview("/food-location/"+uno.name).send();
                      }
                      callback(); // Alternatively: callback(new Error());
                    }, function (err) {
                      if (err) { throw err; }
                      if(m == 0){
                            BOTTONE.sendMessage(chat_id, "I'm so sorry, it seams there aren't any restaurants near you!", 'Markdown')
                            visitor.pageview("/food-no-results").send();
                      }
                    });
                }, 2000);
                


                session_request[chat_id] = "";
            }
                
        break;
    }
}

var venues = {
                      location: [
                        {
                            name: 'Hotel Brufani', 
                            tag: ['brufani'],
                            lat: 43.1084601,
                            long: 12.3852223
                        },
                        {
                            name: "Sala dei Notari",
                            tag: ['notari'],
                            lat: 43.111947,
                            long: 12.3881108
                        },
                        {
                            name: "Teatro Morlacchi",
                            tag: ['morlacchi'],
                            lat: 43.1137652,
                            long: 12.386609
                        },
                        {
                            name: "Centro Servizi G. Alessi",
                            tag: ['alessi'],
                            lat: 43.110803,
                            long: 12.3883468
                        },
                        {
                            name: "Hotel La Rosetta & Restaurant",
                            tag: ['rosetta'],
                            lat: 43.1092874,
                            long: 12.3855836
                        },
                        {
                            name: "Hotel Locanda della Posta",
                            tag: ['posta'],
                            lat: 43.1097139,
                            long: 12.3858835
                        },
                        {
                            name: "Hotel ristorante Perusia La Villa",
                            tag: ['perusia'],
                            lat: 43.1165109,
                            long: 12.3989332
                        },
                        {
                            name: "Hotel Giò Wine e Jazz Area",
                            tag: ['giò'],
                            lat: 43.1125262,
                            long: 12.3753476
                        },
                        {
                            name: "San Gallo Palace Hotel",
                            tag: ['san gallo'],
                            lat: 43.1061396,
                            long: 12.3861238
                        },
                        {
                            name: "Perugia Plaza Hotel",
                            tag: ['plaza'],
                            lat: 43.0959864,
                            long: 12.3836685
                        },
                        {
                            name: "Hotel Alla Posta dei Donini",
                            tag: ['donini'],
                            lat: 43.037917,
                            long: 12.3994033
                        }, 
                        {
                            name: "Hotel Fortuna",
                            tag: ['fortuna'],
                            lat: 43.1096051,
                            long: 12.3851425
                        },
                        {
                            name: "Etruscan Chocohotel",
                            tag: ['chocohotel'],
                            lat: 43.0993652,
                            long: 12.3824819
                        },
                        {
                            name: "Hotel Perugia Ilgo",
                            tag: ['ilgo'],
                            lat: 43.1150091,
                            long: 12.4011722
                        },
                        {
                            name: "Hotel Eden",
                            tag: ['eden'],
                            lat: 43.10919,
                            long: 12.3841214
                        },
                        {
                            name: "Albergo Hotel Umbria",
                            tag: ['umbria'],
                            lat: 43.110854,
                            long: 12.3854073
                        },
                        {
                            name: "Hotel Iris Perugia",
                            tag: ['iris'],
                            lat: 43.1068617,
                            long: 12.3866772
                        },
                        {
                            name: "Hotel Sant'Ercolano",
                            tag: ['ercolano'],
                            lat: 43.1088001,
                            long: 12.3881595
                        },
                        {
                            name: "Albergo Anna",
                            tag: ['anna'],
                            lat: 43.1119729,
                            long: 12.3844386
                        },
                        {
                            name: "Hotel San Sebastiano",
                            tag: ['sebastiano'],
                            lat: 43.1146482,
                            long: 12.3850819
                        },
                        {
                            name: "Hotel Europa",
                            tag: ['europa'],
                            lat: 43.1110215,
                            long: 12.3831289
                        },
                        {
                            name: "Hotel Priori",
                            tag: ['priori'],
                            lat: 43.1117685,
                            long: 12.3850356
                        },
                        {
                            name: "Ostello Mario Spagnoli",
                            tag: ['spagnoli'],
                            lat: 43.1048015,
                            long: 12.3590544
                        },
                        {
                            name: "Ostello della Gioventù Perugia Centro",
                            tag: ['gioventù'],
                            lat: 43.112515,
                            long: 12.3894173
                        },
                        {
                            name: "Ostello Villa Giardino",
                            tag: ['giardino'],
                            lat: 43.1348569,
                            long: 12.4413158
                        },
                        {
                            name: "Bed & Breakfast Poldo e Camilla",
                            tag: ['poldo'],
                            lat: 43.1031681,
                            long: 12.346179
                        },
                        {
                            name: "Fermata Minimetrò Pincetto",
                            tag: ['pincetto'],
                            lat: 43.110109,
                            long: 12.3882103
                        },
                        {
                            name: "Stazione Ferroviaria di Perugia",
                            tag: ['stazione'],
                            lat: 43.1040195,
                            long: 12.3735178
                        },
                        {
                            name: "Hotel Morlacchi",
                            tag: ['morlacchi'],
                            lat: 43.11284,
                            long: 12.3844113
                        },
                        {
                            name: "Agriturismo La Molinella",
                            tag: ['molinella'],
                            lat: 43.1186109,
                            long: 12.4265595
                        },
                        {
                            name: "Auditorium Santa Cecilia",
                            tag: ['cecilia'],
                            lat: 43.1125147,
                            long: 12.3851559
                        },
                        {
                            name: "Sala del Dottorato",
                            tag: ['dottorato'],
                            lat: 43.1124998,
                            long: 12.3869734
                        },
                        {
                            name: "Il Caprifoglio",
                            tag: ['caprifoglio'],
                            lat: 43.1388082,
                            long: 12.5310397
                        },
                        {
                            name: "Fondazione Ranieri Sorbello",
                            tag: ['ranieri'],
                            lat: 43.1126706,
                            long: 12.3882219
                        },
                        {
                            name: "Hostel Little Italy Perugia",
                            tag: ['little'],
                            lat: 43.1134427,
                            long: 12.3872738
                        },
                        {
                            name: "Teatro della Sapienza",
                            tag: ['sapienza'],
                            lat: 43.1096716,
                            long: 12.3843752
                        },
                        {
                            name: "Residenza Baldesca",
                            tag: ['baldesca'],
                            lat: 43.1130826,
                            long: 12.3864711
                        },
                        {
                            name: "Residenza Turrena",
                            tag: ['turrena'],
                            lat: 43.1130162,
                            long: 12.386849
                        }
                      ]
                    }
//export the bot class
module.exports = bot;

// sample keyboard

