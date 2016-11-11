function contains_link(text) {
    return linkify(text) != text;
}

function linkify(text) {  
    var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;  
    return text.replace(urlRegex, function(url) {  
        return '<a target="_blank" href="' + url + '">' + url + '</a>';  
    })  
}

/* Function to replace the \n to break lines in html */
var crlfy = function(text) {
    return text.replace("\n", "<br />");
}

var msgify = function(txt) {
    return linkify(crlfy(txt));
}

exports.msgify = msgify;