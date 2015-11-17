// controllers/users/index.js
//
// Steve Williams

var crypto          = require('crypto');
var debug           = require('debug')('bcsaid:user');

// Data model
var mongoose = require('mongoose');

// Get the model schema used by this controller
var User = mongoose.model('User');

// common Tapp REST API utility methods
//
var rest = require('../../rest.js');

// =======================================
// Specify view engine for this controller
// =======================================
exports.engine = 'jade';

// =======================================
// Guard executed before each route
// =======================================
exports.before = function(req, res, next) {
    // if user is not authenticated in the session, return err and err message
    if (!req.isAuthenticated()) {
        rest.respond_error(res, 2001, 'User not authenticated, please logout and login again');
    } else {
        // if all is good, move on to the next
        return next();
    }
};

// =======================================
// create a new resource
// =======================================
exports.create = function(req, res, next) {

    debug('creating new user: ' + JSON.stringify(req.body));

    /*
     * Normalize incoming fields
     */
    var email = req.body.username.trim();
    var password = req.body.password;
    var username = email.toLowerCase();
    var firstName = req.body.firstName.trim();
    var lastName = req.body.lastName.trim();
    req.body.username = username;
    req.body.firstName = firstName;
    req.body.lastName = lastName;

    User.findOne({ username: username }, function(err, user) {
        if(err) {
            return next(err);
        }

        if(user) {
            rest.respond_error(res, 1001, "Try a different email address, or delete the old account first");
        } else {
            crypto.randomBytes(20, function(err, buf) {
                var key = buf.toString('hex');

                // Create a new User
                var newUser = new User(req.body);

                // set the user's local credentials
                newUser.local.email = email;
                if(password && password.length) {
                    newUser.local.password = newUser.generateHash(password);
                } else {
                    newUser.local.password = newUser.generateHash(key);
                }

                // users added via console are immediately active, it should be an option to use activation email
                newUser.apiToken = key;

                newUser.save(function(err, user){
                    if(err)
                        return next(err);

                    var data = user;
                    rest.respond_ok_with_data(res, 0, 'User "' + req.body.username + '" created', data);
                });
            });
        }
    });
};

// =======================================
// list all resources
// =======================================
exports.list = function(req, res, next) {
    debug('listing all users');

    User
    .find({})
    .sort({ 'name': 'ascending' })
    .exec(function(err, users){
        if(err) {
            return next(err);
        }
        var data = users;

        rest.respond_ok_with_data(res, 0, "list of users in organization", data);
    });
};

// =======================================
// update the specified resource
// =======================================
exports.update = function(req, res, next) {
    var uid = req.params.user_id;
    debug('updating user: ' + uid + " with body: " + JSON.stringify(req.body));

    /*
     * Normalize user data
     */
    var email = req.body.username.trim();
    var password = req.body.password;
    var username = email.toLowerCase();
    var firstName = req.body.firstName.trim();
    var lastName = req.body.lastName.trim();
    req.body.username = username;
    req.body.firstName = firstName;
    req.body.lastName = lastName;

    // set the user's local credentials
    req.body.local = {
        email: email
    };

    if(password && password.length !== 0) {
        req.body.local.password = User.generateHash(password);
    }

    /*
     * User names must be unique, so check uniqueness first.
     *
     * Note: the schema checks for this, so we just allow Mongo to
     *       return an error and catch it
     */
    User.findByIdAndUpdate(uid, req.body, function(err, user) {
        // handle any errors
        if(err) {
            if(err.code === 11000)
                return rest.respond_error(res, 1001, '"' + req.body.username + '" already exists: pick a different name and try again');
            else
                return next(err);
        }

        if(!user) {
            rest.respond_error(res, 1002, 'user with ObjectId "' + uid + '" no longer exists, refresh the browser and retry the update');
        } else {
            rest.respond_ok(res, 0, 'User "' + user.username + '" updated');
        }
    });
};

// =======================================
// delete the specified resource
// =======================================
exports.remove = function(req, res, next) {
    var uid = req.params.user_id;
    debug('deleting user: ' + uid);

    User.findById(uid, function(err, user) {
        if(err)
            return next(err);
        /*
         * Remove via the model to trigger pre-remove hook
         */
        user.remove();
        rest.respond_ok(res, 4, user.username + "user successfully deleted");
    });
};

// =======================================
// query the specified resource
// usually display resource details
// =======================================
// exports.show = function(req, res, next) {
//}

// =======================================
// edit the specified resource
// usually populate a form for editing
// =======================================
// exports.edit = function(req, res, next) {
//}
