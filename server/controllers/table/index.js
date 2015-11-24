// app/controllers/permission/index.js
//
// Steve Williams

var debug = require('debug')('bcsaid:table');

// Data model
var mongoose = require('mongoose');

// Get the model schema used by this controller
var Table = mongoose.model('Table');

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

var tableDef = {
    table : 'users',
    validator: 'UserModel',
    columns : [{
        name: '_id',
        label: "ID",
        editable: false,
        renderable: false,
        cell: 'string'
    }, {
        name: 'username',
        label: 'User Name',
        tooltip: 'This is the login id, it can be an email address, employee number or same other information unique to the employee.',
        cell: 'string',
        validator: 'UniqueStringInCollection'
    }, {
        name: 'firstName',
        label: 'First Name',
        tooltip: 'Real first name',
        cell: 'string',
        validator: 'FirstNameLastNameNotEmpty'
    }, {
        name: 'lastName',
        label: 'Last Name',
        tooltip: 'Real last name',
        cell: 'string',
        validator: 'FirstNameLastNameNotEmpty'
    }, {
        name: 'password',
        label: 'Password',
        tooltip: 'A random password is auto generated on adding the subscriber.  Click the button to set a password',
        cell: 'PasswordCell'
    }, {
        name: 'roles',
        label: 'Roles',
        tooltip: 'The allowed roles for the user',
        cell: 'RoleSelect',
        options: {multiple: true}
    }, {
        name: 'delete',
        label: 'Delete',
        tooltip: 'Delete the team. The user will automatically be removed from all teams',
        cell: 'DeleteCell'
    }]
};

// =======================================
// list all resources
// =======================================
exports.list = function(req, res, next) {
    debug('listing all tables');

    Table.count(function(err, count){
        if(err)
            return next(err);

        if(count === 0) {
            var newTable = new Table(tableDef);
            newTable.save(function(err, table){
                if(err)
                    return next(err);

                for(var j = 0; j < table.columns.length; ++j){
                    var column = table.columns[j];
                    column._id = undefined;
                }
                res.status(200).json([table]);
            });
        } else {
            Table
            .find({}, {_id: 0})
            .exec(function(err, tables){
                if(err) {
                    return next(err);
                }
                for(var i = 0; i < tables.length; ++i){
                    var table = tables[i];
                    for(var j = 0; j < table.columns.length; ++j){
                        var column = table.columns[j];
                        column._id = undefined;
                    }
                }
                res.status(200).json(tables);
            });
        }
    });
};
