// app/models/role.js
// load the things we need
var debug = require('debug')('bcsaid:role');
var mongoose = require('mongoose');
var User = require('./user');

// define the schema for our organization/enterprise model
// A role is associated with a list of permissions
// The permissions can be exposed using an authorised API
// or they can be all sent to the client when the role is
// selected.
//
// The latter choice results in a more responsive client
//
var roleSchema = mongoose.Schema({
    name                : {type: String, unique: true, required: true, dropDups: true },
    description         : {type: String, required: true },
    permissions         : [{type: mongoose.Schema.Types.ObjectId, ref: 'Permission'}]
});

// methods ======================

roleSchema.pre('remove', function(next){
    var name = this.name;
    User.update({ roles: this._id }, {  $pullAll: { roles: [this._id] } }, { multi: true }, function(err, raw) {
        debug("removed role " + name + " from " + raw.n + " users");
        next();
    });
});

// create the model for organizations and expose it to our app
module.exports = mongoose.model('Role', roleSchema);
