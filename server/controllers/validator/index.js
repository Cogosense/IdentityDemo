// app/controllers/permission/index.js
//
// Steve Williams

var debug = require('debug')('bcsaid:validator');

// =======================================
// Specify view engine for this controller
// =======================================
exports.engine = 'jade';

// =============================================
// Pass initialization options to the controller
// used to pass options including the passport
// object required for basic authentication
// =============================================
var passport;
exports.init = function(options) {
     passport = options.passport;
};

// =======================================
// Guard executed before each route
// check user is authenticated, or if API
// endpoint perform basic authentication
// =======================================
exports.before = function(req, res, next) {
    // if user is not authenticated in the session, check for basic auth
    // if noAuthorization header return err and err message
    if (!req.isAuthenticated()) {
        if(req.headers.authorization) {
            // REST api endpoint requires authentication
            passport.authenticate('basic', { session : false }, function(err, user, info) {
                if(err) {
                    return next(err);
                }
                if(!user) {
                    return rest.respond_error(res, 2002, 'API credentials invalid');
                }
                req.logIn(user, function(err) {
                    if (err) {
                        return next(err);
                    }
                    // if all is good, move on to the next
                    return next();
                });
            })(req, res, next);
        } else {
            rest.respond_error(res, 2001, 'User not authenticated, please logout and login again');
        }
    } else {
        // if all is good, move on to the next
        return next();
    }
};

// =======================================
// query the specified resource
// usually display resource details
// =======================================
exports.show = function(req, res, next) {
    var validator = req.params.validator_id;

    var fileName = validator + '.js';
    debug('validator requested: ' + fileName);

    var options = {
        root: __dirname + '/../../../validationRepo',
        dotfiles: 'deny'
    };

    res.sendFile(fileName, options, function(err){
        if (err) {
            debug(err);
            res.status(err.status).end();
        } else {
            debug('Sent:', fileName);
        }
    });
};
