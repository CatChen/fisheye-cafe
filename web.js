const url = require('url');
const redis = require('redis');
const express = require('express');
const connectRedis = require('connect-redis')(express);
const mustache = require('mustache');

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

var createConnectRedis = function() {
    var connectRedisStore;
    if (process.env.REDISTOGO_URL) {
        var redisURL = url.parse(process.env.REDISTOGO_URL);
        connectRedisStore = new connectRedis({
            port: redisURL.port,
            host: redisURL.hostname,
            pass: redisURL.auth.split(":")[1]
        });
    } else {
        connectRedisStore = new connectRedis();
    }
    return connectRedisStore;
};

var store = createRedisClient();
var app = express.createServer();

app.use(express.logger());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({ secret: "catchen@catchen.me", store: createConnectRedis() }));
app.use(app.router);
app.use(express.static(__dirname + '/content'));
app.use(express.errorHandler({ showStack: true, dumpExceptions: true }));


//app.set("view engine", "mustache");
app.register('.mustache', {
    compile: function(template, options) {
        return function(data) {
            return mustache.to_html(template, data);
        };
    }
});

app.get('/', function(request, response) {
    if (request.query._escaped_fragment_) {
        response.send('Hello bot!');
        // TODO: handle Google's request
    } else {
        response.send('Hello visitor!');
    }
});

app.get('/users(/:id)?', function(request, response) {
    response.redirect('/#!/users/' + (request.params.id || ''));
});

app.post('/users/', function(request, response) {});

app.put('/users/:id', function(request, response) {});

app.del('/users/:id', function(request, response) {});

app.get('/roles(/:id)?', function(request, response) {
    response.redirect('/#!/roles/' + (request.params.id || ''));
});

app.post('/roles/', function(request, response) {});

app.put('/roles/:id', function(request, response) {});

app.del('/roles/:id', function(request, response) {});

app.get('/products(/:id)?', function(request, response) {
    if (!request.header('X-Requested-With')) {
        response.redirect('/#!/products/' + (request.params.id || ''));
    } else {
        // TODO: render partial view
    }
});

app.post('/products/', function(request, response) {});

app.put('/products/:id', function(request, response) {});

app.del('/products/:id', function(request, response) {});

app.get('/orders(/:id?)', function(request, response) {
    response.redirect('/#!/orders/' + (request.params.id || ''));
});

app.post('/orders/', function(request, response) {});

app.put('/orders/:id', function(request, response) {});

app.del('/orders/:id', function(request, response) {});

app.get('/login', function(request, response) {
    
});

app.post('/login', function(request, response) {
    
});

app.get('/logout', function(request, response) {
    
});

app.get('/changepassword', function(request, response) {
    
});

app.post('/changepassword', function(request, response) {
    
});

var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Listening on " + port);
});
