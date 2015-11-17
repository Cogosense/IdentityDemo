// app/models/permission.js
// load the things we need
var debug = require('debug')('bcsaid:permission');
var mongoose = require('mongoose');
var Role = require('./role');

// define the schema for our permissions model
// Simply use the name to check against a specific permission
var permissionSchema = mongoose.Schema({
    name                : {type: String, unique: true, required: true, dropDups: true },
    description         : {type: String, required: true },
});

// methods ======================

permissionSchema.pre('remove', function(next){
    var name = this.name;
    Role.update({ permissions: this._id }, {  $pullAll: { permissions: [this._id] } }, { multi: true }, function(err, raw) {
        debug("removed permission " + name + " from " + raw.n + " roles");
        next();
    });
});

// create the model for organizations and expose it to our app
module.exports = mongoose.model('Permission', permissionSchema);
