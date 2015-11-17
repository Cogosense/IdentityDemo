// controllers/regions/index.js
//
// Steve Williams

var debug = require('debug')('bcsaid:auth');

// Data model
var mongoose = require('mongoose');

// Get the model schema used by this controller
var User = mongoose.model('User');

// common Tapp REST API utility methods
//
var rest = require('../../../../../rest.js');

// =======================================
// Specify view engine for this controller
// =======================================
exports.engine = 'jade';

// ============================================
// Specify the mount prefix for this controller
// ============================================
// exports.prefix = '/api/acorn';


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
// create a new resource
// =======================================
exports.create = function(req, res, next) {
    debug('creating Auth tokens');
    var authMech = req.body.mech;

    if(authMech === 'local'){
        passport.authenticate('api-login', function(err, user, info) {
            if(err) {
                return next(err);
            }
            if(!user) {
                return rest.respond_error(res, 2002, "User authentication for API use failed");
            }
            if(user.activationKey) {
                return rest.respond_error(res, 2003, "User account has not been activated yet");
            }
            var data = {
                hash: user.id,
                token: user.apiToken
            };
            rest.respond_ok_with_data(res, 1, "User authenticated successfully", data);
        })(req, res, next);
    } else {
        return rest.respond_error(res, 2004, "Software error, contact support");
    }
};

exports.remove = function(req, res, next) {
    debug('destroying Auth tokens');
    // XXX this route needs to destroy the API tokens, the create needs to be updated to create new tokens
    rest.respond_ok_with_data(res, 4, "User API tokens successfully destroyed");
};
