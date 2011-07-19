const Async = require('jshelpers').Async;

const url = require('url');
const path = require('path');
const redis = require('redis');
const express = require('express');
const connectRedis = require('connect-redis')(express);

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

var createConnectRedisClient = function() {
    var connectRedisClient;
    if (process.env.REDISTOGO_URL) {
        var redisURL = url.parse(process.env.REDISTOGO_URL);
        connectRedisClient = new connectRedis({
            port: redisURL.port,
            host: redisURL.hostname,
            pass: redisURL.auth.split(":")[1]
        });
    } else {
        connectRedisClient = new connectRedis();
    }
    return connectRedisClient;
};

const redisClient = createRedisClient();
const connectRedisClient = createConnectRedisClient();
const user = require('redis-user')(redisClient, true); /* use Async = true */

var app = express.createServer();

app.use(express.logger());
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.session({ secret: "catchen@catchen.me", store: connectRedisClient }));
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.errorHandler({ showStack: true, dumpExceptions: true })); // options are not for production

app.set("view engine", "mustache");
app.set("views", path.join(__dirname, 'views'));
app.register(".mustache", require('stache'));

app.get('/', function(request, response) {
    if (request.query._escaped_fragment_) {
        response.send('Hello bot!');
        // TODO: handle Google's request
    } else {
        response.render('index', {
            title: 'Welcome',
            session: request.session.user
        });
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
    response.render('login', {});
});

app.post('/login', function(request, response) {
    var email = request.body.email;
    var password = request.body.password;
    user.validateUser(email, password, function(validated) {
        if (validated) {
            var sessionUser = {
                email: email,
                roles: {}
            };
            /* TODO: turn this into parallel by using Async */
            Async
                .collect([
                    function() { return user.role.isUserInRoleAsync(email, 'manager')
                        .addCallback(function(result) { sessionUser.roles.manager = result; request.session.user = sessionUser; })},
                    function() { return user.role.isUserInRoleAsync(email, 'employee')
                        .addCallback(function(result) { sessionUser.roles.employee = result; request.session.user = sessionUser; })},
                    function() { return user.role.isUserInRoleAsync(email, 'visitor')
                        .addCallback(function(result) { sessionUser.roles.visitor = result; request.session.user = sessionUser; })}
                ])
                .addCallback(function(results) {
                    request.session.user = sessionUser;
                    response.redirect('/');
                });
        } else {
            response.render('login', {
                email: email,
                error: {
                    message: 'incorrect email or password'
                }
            });
        }
    })
});

app.post('/logout', function(request, response) {
    request.session.destroy();
    response.redirect('/');
});

app.get('/updatepassword', function(request, response) {
    
});

app.post('/updatepassword', function(request, response) {
    
});

app.get('/resetpassword', function(request, response) {
    
});

app.post('/resetpassword', function(request, response) {
    
});

var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Listening on " + port);
});
