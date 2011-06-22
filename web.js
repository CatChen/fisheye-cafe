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
  response.send('Hello visitor!');
});

app.get('/products/:id?', function(request, response) { response.redirect('/#!/products/' + (request.params.id || '')); });

app.put('/orders/', function(request, response) { response.redirect('/#!/orders/'); });

app.post('/orders/:id', function(request, response) {});

app.get('/manage/', function(request, response) {
    response.send('Hello manager!');
});

app.get('/manage/users/:id?', function(request, response) { response.redirect('/manage/#!/users/' + (request.params.id || '')); });

app.put('/manage/users/', function(request, response) {});

app.post('/manage/users/:id', function(request, response) {});

app.del('/manage/users/:id', function(request, response) {});

app.get('/manage/products/:id?', function(request, response) { response.redirect('/manage/#!/products/' + (request.params.id || '')); });

app.put('/manage/products/', function(request, response) {});

app.post('/manage/products/:id', function(request, response) {});

app.del('/manage/products/:id', function(request, response) {});

app.get('/manage/orders/:id?', function(request, response) { response.redirect('manage/#!/products/' + (request.params.id || '')); });

app.put('/manage/orders/', function(request, response) {});

app.post('/manage/orders/:id', function(request, response) {});

var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Listening on " + port);
});
