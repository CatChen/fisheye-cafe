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
    if (request.header('X-Requested-With') == 'XMLHttpRequest') {
        if (request.session.user.roles.manager) {
            if (!request.params.id) {
                user.listUsersAsync()
                    .addCallback(function(users) {
                        if (users) {
                            response.send(JSON.stringify(users));
                        } else {
                            response.send(404);
                        }
                    });
            } else {
                user.getUserAsync(parseInt(request.params.id))
                    .addCallback(function(user) {
                        if (user) {
                            response.send(JSON.stringify(user));
                        } else {
                            response.send(404);
                        }
                    });
            }
        } else {
            /* unauthorized */
            response.send(403);
        }
    } else {
        response.redirect('/#!/users/' + (request.params.id || ''));
    }
});

app.post('/users/', function(request, response) {
    if (request.session.user.roles.manager) {
        user.createUserAsync(request.params.email, request.params.password)
            .addCallback(function(result) {
                if (result) {
                    /* TODO: should send the newly created user back */
                    response.send(201);
                } else {
                    response.send(500);
                }
            });
    } else {
        /* unauthorized */
        response.send(403);
    }
});

app.put('/users/:id', function(request, response) {
    if (request.session.user.roles.manager || (request.session.user.roles.employee && request.session.user.email == request.params.email)) {
        user.updateUserPasswordAsync(request.params.email, request.params.password)
            .addCallback(function(result) {
                if (result) {
                    /* TODO: should send the newly updated user back */
                    response.send(200);
                } else {
                    response.send(500);
                }
            });
    } else {
        /* unauthorized */
        response.send(403);
    }
});

app.del('/users/:id', function(request, response) {
    if (request.session.user.roles.manager) {
        Async
            .chain()
            .go(parseInt(request.params.id))
            .next(user.getUserAsync)
            .next(function(user) { return user.email; })
            .next(user.deleteUserAsync)
            .next(function(result) {
                if (result) {
                    response.send(204);
                } else {
                    response.send(500);
                }
            });
        } else {
            /* unauthorized */
            response.send(403);
        }
});

app.get('/roles(/:id)?', function(request, response) {
    if (request.header('X-Requested-With') == 'XMLHttpRequest') {
        if (request.session.user.roles.manager) {
            if (!request.params.id) {
                user.role.listRolesAsync()
                    .addCallback(function(roles) {
                        if (roles) {
                            response.send(JSON.stringify(roles));
                        } else {
                            response.send(404);
                        }
                    });
            } else {
                user.getRoleAsync(parseInt(request.params.id))
                    .addCallback(function(role) {
                        if (role) {
                            response.send(JSON.stringify(role));
                        } else {
                            response.send(404);
                        }
                    });
            }
        } else {
            /* unauthorized */
            response.send(403);
        }
    } else {
        response.redirect('/#!/roles/' + (request.params.id || ''));
    }
});

app.post('/roles/', function(request, response) {
    /* lock the roles */
    response.header('Allow', 'GET');
    response.send(405);
});

app.put('/roles/:id', function(request, response) {
    /* lock the roles */
    response.header('Allow', 'GET');
    response.send(405);
});

app.del('/roles/:id', function(request, response) {
    /* lock the roles */
    response.header('Allow', 'GET');
    response.send(405);
});

app.get('/products(/:id)?', function(request, response) {
    if (request.header('X-Requested-With') == 'XMLHttpRequest') {
        // TODO: send JSON
    } else {
        response.redirect('/#!/products/' + (request.params.id || ''));
    }
});

app.post('/products/', function(request, response) {});

app.put('/products/:id', function(request, response) {});

app.del('/products/:id', function(request, response) {});

app.get('/orders(/:id?)', function(request, response) {
    if (request.header('X-Requested-With') == 'XMLHttpRequest') {
        // TODO: send JSON
    } else {
        response.redirect('/#!/orders/' + (request.params.id || ''));
    }
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
