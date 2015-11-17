// app/controllers/permission/index.js
//
// Steve Williams

var debug = require('debug')('bcsaid:permission');

// Data model
var mongoose = require('mongoose');

// Get the model schema used by this controller
var Permission = mongoose.model('Permission');

// common Tapp REST API utility methods
//
var rest = require('../../rest.js');

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
// create a new resource
// =======================================
exports.create = function(req, res, next) {
    debug('creating permission :' + JSON.stringify(req.body));

    Permission.findOne({ name: req.body.name}, function(err, permission) {
        // handle any errors
        if(err) {
            return next(err);
        }

        if(permission) {
            rest.respond_error(res, 3001, '"'+req.body.name+'" already exists: pick a different name and try again');
        } else {
            // Create a new team
            var newPermission = new Permission(req.body);

            newPermission.save(function(err, permission) {
                if(err) {
                    return next(err);
                }
                var data = permission;
                rest.respond_ok_with_data(res, 1, 'Permission "' + req.body.name + '" created', data);
            });
        }
    });
};

// =======================================
// list all resources
// =======================================
exports.list = function(req, res, next) {
    debug('listing all permissions');

    Permission
    .find({})
    .sort({ 'name': 'ascending' })
    .exec(function(err, permissions){
        if(err) {
            return next(err);
        }

        var data = permissions;

        rest.respond_ok_with_data(res, 0, "list of all current permissions", data);
    });
};

// =======================================
// update the specified resource
// =======================================
exports.update = function(req, res, next) {
    var pid = req.params.permission_id;
    debug('updating permission: ' + pid + " with body: " + JSON.stringify(req.body));

    /*
     * Permission names must be unique, so check uniqueness first.
     *
     * Note: the schema checks for this, so we just allow Mongo to
     *       return an error and catch it
     */
    Permission.findByIdAndUpdate(pid, req.body, function(err, permission) {
        if(err) {
            if(err.code === 11000)
                return rest.respond_error(res, 3001, '"' + req.body.name + '" already exists: pick a different name and try again');
            else
                return next(err);
        }
        if(!permission) {
            rest.respond_error(res, 3002, 'permission with ObjectId "' + pid + '" no longer exists, refresh the browser and retry the update');
        } else {
            rest.respond_ok(res, 0, 'Permission "' + permission.name + '" updated');
        }
    });
};

// =======================================
// delete the specified resource
// =======================================
exports.remove = function(req, res, next) {
    var pid = req.params.permission_id;
    debug('deleting permission: ' + pid);
    Permission.findById(pid, function(err, permission) {
        if(err)
            return next(err);
        /*
         * Remove via the model to trigger pre-remove hook
         */
        permission.remove();
        rest.respond_ok(res, 4, permission.name + " permission successfully deleted");
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
