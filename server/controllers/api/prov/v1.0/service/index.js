// controllers/service/index.js
//
// Steve Williams

// Data model
var debug = require('debug')('bcsaid:prov');
var mongoose = require('mongoose');
var async = require('async');
var merge = require('merge');

// Get the model schema used by this controller
var Team = mongoose.model('User');

// common Tapp REST API utility methods
//
var rest = require('../../../../../rest.js');

// =======================================
// Specify the mount prefix for this controller
// =======================================
//exports.prefix = '/api/prov';

// =======================================
// Specify view engine for this controller
// =======================================
exports.engine = 'jade';

// =============================================
// Pass initialization options to the controller
// ==============================================
exports.init = function(options) {
    passport = options.passport;
};

// =======================================
// Guard executed before each route
// =======================================
exports.before = function(req, res, next) {
    // authenticate api use using the Authorization header, return error if
    // authentication fails
    passport.authenticate('basic', { session : false }, function(err, user, info) {
        if(err) return next(err);
        if(!user) {
            return rest.respond_error(res, 2002, 'API credentials invalid');
        }
        req.logIn(user, function(err) {
            if (err) {  return next(err); }
            return next();
        });
    })(req, res, next);
};


// =======================================
// query the specified resource
// usually display resource details
// =======================================
exports.show = function(req, res, next) {
    var appName = req.params.service_id;
    debug('user requested service config for application ' + appName);

    req.user.populate('organizations', function(err, user){
        /*
         * For Tapp it is assumed each user always has just one organization
         */
        createUserConfiguration(req.user, req.user.organizations[0], function(err, configuration) {
            if(err) {
                debug("unexpected error: " + err);
                return rest.respond_error(res, 5002, "unexpected error");
            }

            /*
             * can send JSON object here with service config, resources and zones
             * {
             *     provision : {
             *         TSIPAA: active service address
             *         TSIPAS: standby service address
             *     },
             *     apps : {
             *         acorn: [ common Acorn config],
             *         tapp: [
             *             common tapp config
             *             RZC : [
             *                 {
             *                     provision : {
             *                         TSIPAA: active service address for zone
             *                         TSIPAS: standby service address for zone
             *                     },
             *                     plmns: [ plmn1, plmn2 ....],
             *                     cells: [ cell1, cell2 ....],
             *                     waps : [ wap1, wap2 ....],
             *                 }
             *             ]
             *         ]
             *     },
             *     resources : [
             *         {
             *             name : String,
             *             url : String,
             *             md5 : String,
             *             mtime : Integer
             *         },
             *         ....
             *     ]
             * }
             */
            debug('sending service response: '+JSON.stringify(configuration));
            rest.respond_ok_with_data(res, 0, "service configuration", configuration);
        });
    });
};

function createUserConfiguration(user, organization, callback){
    debug('user requested RZC for organization: ' + organization);

    async.waterfall([
        function(done){
            /*
             * Get a list of teams the user is in from the
             * organization. then look for the app config
             * in each team.
             */
            Team.find({ organization : organization._id, users: user._id })
            .exec(function(err, teams){
                done(err, organization, teams);
            });
        },
        function(organization, teams, done) {
            /*
             * Get the default tapp service addresses
             */
            var TSIPAA = organization.tsipaa;
            var TSIPAS = organization.tsipas;

            /*
             * The team config is sent to the associated remote server specified in
             * the team config.
             *
             * An RZC config parameter has to be built that allows a remote server to
             * advertize the zones of other servers the users are associated with.
             */
            var RZC = [ ];
            var plmns = {};
            var cells = {};
            var waps = {};
            var zones = {};
            for(var i = 0; i < teams.length; ++i) {
                var team = teams[i];
                var tsipaa = TSIPAA;
                var tsipas = TSIPAS;
                if(team.clientServiceAddr) {
                    tsipaa = team.clientServiceAddr;
                    tsipas = team.clientServiceAddr;
                }

                var zonekey = tsipaa+tsipas;
                var zone;
                if(zones[zonekey])
                    zone = zones[zonekey];
                else
                    zone = {
                        plmns: [],
                        cells: [],
                        waps: [],
                        provision: {
                            TSIPAA: tsipaa,
                            TSIPAS: tsipas
                        }
                    };

                if(team.plmn){
                    if(plmns[team.plmn]){
                        if(plmns[team.plmn] !== zonekey)
                            console.log('WARNING: team ' + team.name + 'duplicate network zone ignored');
                        continue;
                    } else {
                        plmns[team.plmn] = zonekey;
                    }
                    zone.plmns.push(team.plmn);
                }
                if(team.cid){
                    if(cells[team.cid]){
                        if(cells[team.cid] !== zonekey)
                            console.log('WARNING: team ' + team.name + 'duplicate cell zone ignored');
                        continue;
                    } else {
                        cells[team.cid] = zonekey;
                    }
                    zone.cells.push(parseInt(team.cid));
                }
                if(team.bssid){
                    if(waps[team.bssid]){
                        if(waps[team.bssid] !== zonekey)
                            console.log('WARNING: team ' + team.name + 'duplicate wlan zone ignored');
                        continue;
                    } else {
                        waps[team.bssid] = zonekey;
                    }
                    zone.waps.push(team.bssid);
                }
                zones[zonekey] = zone;
            }

            for(var z in zones)
                RZC.push(zones[z]);

            var configuration;
            if(RZC.length){
                configuration = {
                    apps: {
                        tapp: {
                            config: {
                                RZC: RZC
                            }
                        }
                    }
                };
            }
            done(undefined, configuration);
        }
    ], callback);
}

function docToConfiguration(doc) {
    var acornlen = doc.apps.acorn.length;
    var tapplen = doc.apps.tapp.length;
    var configuration = {
        _id: doc._id,
        apps: {
            cfgid : doc.apps.cfgid,
            acorn : acornlen > 0 ?  doc.apps.acorn[acornlen-1].toObject() : {},
            tapp : tapplen > 0 ?  doc.apps.tapp[tapplen-1].toObject() : {}
        }
    };
    return configuration;
}
