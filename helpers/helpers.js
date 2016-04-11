/** Converts numeric degrees to radians */
if(typeof(Number.prototype.toRad) === "undefined") {
    Number.prototype.toRad = function () {
        return this * Math.PI / 180;
    }
}

module.exports = {

    messageType: function(data) {
        if (data.body.message.text)
            return "text";
        else if (data.body.message.location)
            return "location";
        else if(data.body.message.photo)
            return "photo"
    },

    isCommand: function(data) {
        if (data.charAt(0) == '/')
            return true;
        else
            return false;
    },

    // start and end are objects with latitude and longitude
//decimals (default 2) is number of decimals in the output
//return is distance in kilometers. 
    getDistance: function(start, end, decimals) {
        decimals = decimals || 6;
        var earthRadius = 6371; // km
        lat1 = parseFloat(start.latitude);
        lat2 = parseFloat(end.latitude);
        lon1 = parseFloat(start.longitude);
        lon2 = parseFloat(end.longitude);

        var dLat = (lat2 - lat1).toRad();
        var dLon = (lon2 - lon1).toRad();
        var lat1 = lat1.toRad();
        var lat2 = lat2.toRad();

        var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = earthRadius * c;
        return Math.round(d * Math.pow(10, decimals)) / Math.pow(10, decimals);
    },

    textResponse: {
        beer: "\n\nIf you found @CinemasBot useful, offer me a 🍺!\nPaypal: https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=PX3EU8YNJF8JS",
        author: "The creator of this amazing Bot is the brilliant @nicksruggeri 😎",
        hint_keyboard: "Use your keyboard with these options to reply",
        example: "Ex: /getcinema Venezia or /getcinema 31010 (postal code)",
        sorry: "Sorry, cinemas not found in "
    }

}