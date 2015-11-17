// app/models/organization.js
// load the things we need
var mongoose = require('mongoose');

var schemaVersion = 1;

// define the schema for our Acorn infrastructure
// OTA configuration
var acornConfigSchema = mongoose.Schema({
    version : { type: Number, required: true, default: schemaVersion},
    created : { type: Date, required: true, default: Date.now()},
    config : {
        CFGPSHT : Number,
        MTM     : {
            e   : { type: Boolean, required: true},
            dsd : Number,
            ds  : Number,
            dt  : Number
        },
        MDT     : {
            e   : { type: Boolean, required: true}
        },
        MPT     : {
            e   : { type: Boolean, required: true},
            rt  : Number
        }
    }
});

// methods ======================

acornConfigSchema.methods.requiresUpgrade = function() {
    return this.version != schemaVersion;
};

acornConfigSchema.methods.upgrade = function() {
    if(!this.requiresUpgrade())
        return this;

    var previous = this;
    var next;
    /*
     * catch up older schemas
     */
    while(previous.version < schemaVersion){
        switch(previous.version) {
            case 1: {
                var v2Schema = require('./acorn_config_v2');
                next = new V2Schema();
                /*
                 * convert previous -> next;
                 */
                break;
            }
            case 2: {
                break;
            }
        }
        previous = next;
    }
    return next;
};

acornConfigSchema.pre ('validate', function(next) {
    if(this.version !== schemaVersion)
        throw VersionMisMatchError("tried to save old version of schema");
    next();
});

// create the model for organizations and expose it to our app
module.exports = acornConfigSchema;
