# IJFBot
Telegram Bot for [International Journalism Festival](http://www.journalismfestival.com).

This bot is entirely based on the [Telegram Bot Bootstrap](http://kengz.github.io/telegram-bot-bootstrap/) by *kengz* (thank you so much!) and was developed in 2016 for the 10th edition of the IJF. After the event, it was release as Open Source Software under the MIT License in memory of Aaron Swartz.

Since this project was developed precisely for the Festival, it could be difficult to adapt to other use. I'm sorry about this. 


## Installation
Do

```
git clone https://github.com/ttan/IJFBot.git
```
then

```
npm install
```

You'll get a full deploy-ready project of the bot: you just have to provide datas and tokens.

If you haven't already, get a bot from [BotFather](https://core.telegram.org/bots) and remember your bot *token*!

## Data sources

### Events data

All data about the events are gathered from an online xml file called (and cached) by `bot.js` - see example in `db/ijf.xml`. All events are in the format:

```
<evento> 
			<eventID>1184</eventID> 
			<titolo>Voci del Mattino - RAI Radio 1</titolo> 
			<data>2016-04-6 06:00:00</data> 
			<date_start>2016-04-06 06:00:00</date_start>
			<date_end>2016-04-06 08:00:00</date_end>	  
			<categoria>live from Perugia</categoria> 
			<speakers>Paolo Salerno</speakers> 
			<location>Hotel Brufani - Bar Bellavista</location> 
			<descrizione><![CDATA[
Broadcast live from the Hotel Brufani in Perugia, the RAI Radio 1 news analysis morning show Voci del Mattino presented by Paolo Salerno. Festival speakers will take part.]]></descrizione>
			<url>http://www.journalismfestival.com/programme/2016/voci-del-mattino-rai-radio-1-3</url>
	</evento>
```

### Location data

Info for the `/locate` command are in the bot.js file, coded in JSON. I suggest to move this info in a separate file in `/db` folder.

### Restaurants

Info for the `/food` command are in the `/db/restaurants.json` file.
*Please note that the `/food` command was not disclosed in the current version of the bot and not tested*

## Contacts and help

Do not hesitate to contact me for any question:
- telegram: [@tommasotani](http://telegram.me/tommasotani)
- twitter: [@ttan_](https://www.twitter.com/ttan_)
- web: [http://www.ttan.org](http://www.ttan.org) - [http://www.journalismfestival.com](http://www.journalismfestival.com)
