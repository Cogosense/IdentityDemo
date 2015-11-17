//
// In development start as:
//  (Run)                            : npm start app
//  (Run and restart on code change) : nodemon -w server ./bin/www
//  (Run in browser debugger)        : node-debug ./bin/www
//
// Turn on debugging by setting the environment variable DEBUG
// i.e.
// DEBUG="*" nodaemon ./bin/www
// DEBUG="bcsaid:*" ./bin/www
//
//  In production start as:
//  ./bin/www
//

var pjson = require('../package.json');
var config = require('config');
var debug = require('debug')('bcsaid:server');
var fs = require('fs');

var express = require('express');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var session = require('express-session');
var ua = require('./ua.js');

var app = express();

// configuration
mongoose.connect(config.get('database.url'));

// Set globals for Jade templates
app.locals.debugEnabled = debug.enabled;
app.locals.env = app.settings.env;
app.locals.name = pjson.name;
app.locals.version = pjson.version;
app.locals.config = config.view;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in ../public
app.use(favicon(__dirname + '/../public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

/*
 * Sessions required for passport.
 * Control the express session, allow sessions
 * for web and disable for API session that
 * use basic authentication
 */

var sessionfn = session({
    secret: "trakingapplicationsecret",
    resave: true,
    saveUninitialized: true
});

app.use(function(req,res,next){
    if(req.headers.authorization) {
        return next();
    }
    return sessionfn(req,res,next);
});

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(ua);

//
// Return the current client JSON config
//
app.use('/config', function(req, res, next){
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(config.get('client'));
});

//
// Return the current client JSON config
//
app.use('/apk', function(req, res, next){
    var apkFile = path.join(__dirname, 'apks/' + config.server.apk);
    //if(!fs.existsSync(apkFile))
    //    return res.status(404).send('Sorry no APKs here');

    res.download(apkFile, config.server.apk);
    /*
    var stat = fs.statSync(apkFile);

    res.writeHead(200, {
        'Content-Type': 'application/vnd.android.package-archive',
        'Content-Length': stat.size
    });
    var rds = fs.createReadStream(apkFile);
    rds.pipe(res);
    */
});

/*
 * Add an X-ACORN header, used to
 * detect proxies that incorrectly
 * return 404 instead of 504. The
 * client checks all 404 codes
 * come with an X-ACORN header, if not
 * they are mapped to 504.
 */
app.use(function(req, res, next) {
    res.header('X-ACORN', pjson.name + '-' + pjson.version);
    next();
});

// load controllers
require('./boot')(app, {
    passport: passport
});

require('./auth.js')(app, passport);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'dev') {
    app.use(function(err, req, res, next) {
        if(err.errors)
            return next(err);
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    if(err.errors) {
        res.status(err.status || 422);
        res.render('validation', {
            message: err.message,
            errors: err.errors
        });
    } else {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    }
});

/**
 * Are we using https?
 */
var secure = config.get('server.secure');

/*
 * get the server port
 */
var http = app.get('transport');
var port = normalizePort(config.get('server.port') || process.env.PORT || '9110');
app.set('port', port);

/**
 * Create transports
 */
var http = require(secure ? 'https' : 'http');
app.set('transport', http);

/**
 * Create the HTTP server
 */
if(secure === true) {
    var privateKey  = fs.readFileSync(config.get('server.certificateFile'), 'utf8');
    var certificate = fs.readFileSync(config.get('server.privateKeyFile'), 'utf8');
    var credentials = { key: privateKey, cert: certificate };
    var httpServer = http.createServer(credentials, app);
} else {
    var httpServer = http.createServer(app);
}

var io = require('./io');
io.createServer(httpServer);
app.set('server', httpServer);

debug('Express started HTTP on port ' + port);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

module.exports = app;
