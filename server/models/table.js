// app/models/permission.js
// load the things we need
var debug = require('debug')('bcsaid:table');
var mongoose = require('mongoose');

// define the schema for our permissions model
// Simply use the name to check against a specific permission
var tableSchema = mongoose.Schema({
    table          : {type: String, unique: true, required: true },
    validator      : String,
    columns        : [{
        name          : {type: String, required: true },
        label         : {type: String, required: true },
        editable      : Boolean,
        renderable    : Boolean,
        tooltip       : String,
        cell          : String,
        options       : Object,
        validator     : String
    }]
});

// methods ======================

// create the model for organizations and expose it to our app
module.exports = mongoose.model('Table', tableSchema);
