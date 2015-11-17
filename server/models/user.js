// app/models/user.js
// load the things we need
var debug = require('debug')('bcsaid:user');
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
var userSchema = mongoose.Schema({

    local                      : {
        email                  : String,
        password               : String,
        resetPasswordToken     : String,
        resetPasswordExpires   : Date
    },
    // username is a lower case copy of email
    // and is the primary user id
    username               : String,
    activationKey          : String,
    apiToken               : String,
    firstName              : String,
    lastName               : String,
    superAdmin             : Boolean,
    roles                  : [{type: mongoose.Schema.Types.ObjectId, ref: 'Role'}],
    dv                     : { type: Number, default: 0}
});

// methods ======================

userSchema.pre('save', function(next) {
    ++this.dv;
    next();
});

// generating a hash statically
userSchema.statics.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// checking if API token is valid
userSchema.methods.validApiToken = function(token) {
    return token === this.apiToken;
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
