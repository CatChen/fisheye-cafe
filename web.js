const express = require('express');
const redis = require('redis');
const url = require('url');

var createRedisClient = function() {
    var redisClient;
    if (process.env.REDISTOGO_URL) {
        var redisURL = url.parse(process.env.REDISTOGO_URL);
        redisClient = redis.createClient(redisURL.port, redisURL.hostname);
        redisClient.auth(redisURL.auth.split(":")[1]);
    } else {
        redisClient = redis.createClient();
    }
    return redisClient;
};

var store = createRedisClient();
var app = express.createServer(express.logger(), express.bodyParser());

app.get('/', function(request, response) {
  response.send('Hello World!');
});

var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Listening on " + port);
});
