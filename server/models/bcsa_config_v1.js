// app/models/organization.js
// load the things we need
var mongoose = require('mongoose');

var version = 1;

// define the schema for the Tapp application
// OTA configuration
var tappConfigSchema = mongoose.Schema({
    version : { type: Number, required: true, default: version },
    created : { type: Date, required: true, default: Date.now()},
    config : {
    }
});

// methods ======================

tappConfigSchema.pre('init', function(next) {
    this.version = version;
    next();
});

tappConfigSchema.pre('validate', function(next) {
    this.version = version;
    next();
});

// create the model for organizations and expose it to our app
module.exports = tappConfigSchema;
