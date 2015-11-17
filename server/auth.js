// app/auth.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;
var BasicStrategy   = require('passport-http').BasicStrategy;
var async           = require('async');
var crypto          = require('crypto');
var debug           = require('debug')('bcsaid:auth');

// load up the user model
var User            = require('./models/user');

// emailer
var email = require('./email.js');

// Common authentication errors
var invalidEmail = new Error('Sorry, the email you used is not recognized');
var invalidPassword = new Error('Sorry, the password is incorrect');

// expose this function to our app using module.exports
module.exports = function(app, passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        debug("serializing user: " + user.username);
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            debug("deserializing user: " + user.username);
            done(err, user);
        });
    });

    // =========================================================================
    // API AUTH  ===============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use(new BasicStrategy(
    function(username, password, done) { // callback with user_id and password from the "Authorization: Basic"" http header

        debug("authenticate using basic digest user: " + username);

        // find a user by id
        User.findById(username, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false);

            // if the user is found but the password is wrong
            if (!user.validApiToken(password))
                return done(null, false);

            debug("authenticated using basic digest user: " + user.username);

            // all is well, return successful user
            return done(null, user);
        });

    }));

    // =========================================================================
    // API LOGIN (obtain API tokens for API AUTH strategy) ===================
    // =========================================================================
    // Do not use sessions - therefore no flash messages

    passport.use('api-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        debug("authenticate using login API user: " + email);

        // find a user whose email is the same as the forms email in lowercase
        // we are checking to see if the user trying to login already exists
        var username = email.trim().toLowerCase();
        User.findOne({ 'username' :  username }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false);

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false);

            debug("authenticated using local login user: " + user.username);

            // all is well, return successful user
            return done(null, user);
        });

    }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        debug("authenticate using local login user: " + email);

        // find a user whose email is the same as the forms email in lowercase
        // we are checking to see if the user trying to login already exists
        var username = email.trim().toLowerCase();
        User.findOne({ 'username' :  username }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('errorMessage', 'Sorry we were unable to locate your account.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('errorMessage', 'Have you forgotten your password?')); // create the errorMessage and save it to session as flashdata

            debug("authenticated using local login user: " + user.username);

            // all is well, return successful user
            return done(null, user);
        });
    }));

    // ====================================
    // Install express routes to initiate authentiction functions:
    // 1. Signup
    // 2. Login
    // 3. Forgot Password
    // 4. Reset Password
    // 5. View Profile
    // ====================================


    // =====================================
    // HOME PAGE (with login links) ========
    // =====================================
    app.get('/', function(req, res) {
        if(!req.isAuthenticated()){
            debug("user not logged in redirecting to login page");
            res.redirect('/login');
        } else {
            debug("user logged in rendering index page");
            res.render('index.jade', {
                superAdmin : req.user ? req.user.superAdmin : false
            }); // load the index.jade file
        }
    });

    // =====================================
    // SIGNUP ==============================
    // =====================================
    // show the signup form
    app.get('/signup', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('signup.jade', {
            error: req.flash('errorMessage'),
            info: req.flash('infoMessage'),
            success: req.flash('successMessage')
        });
    });

    app.post('/signup', function(req, res, next){
        async.waterfall([
            function(done) {
                if(!req.body.firstName) {
                    done('A first name must be provided.');
                } else if(!req.body.lastName) {
                    done('A last name must be provided.');
                } else if(req.body.password != req.body.confirm) {
                    done('The passwords are not the same.');
                }
                else
                {
                    crypto.randomBytes(20, function(err, buf) {
                        var key = buf.toString('hex');
                        done(err, key);
                    });
                }
            },
            function(key, done) {
                var email = req.body.email.trim();
                var username = email.toLowerCase();
                var firstName = req.body.firstName.trim();
                var lastName = req.body.lastName.trim();

               // find a user whose email is the same as the forms email
                // we are checking to see if the user trying to login already exists
                User.count(function(err, count) {
                    User.findOne({ 'username' :  username }, function(err, user) {
                        // if there are any errors, return the error
                        if (err) {
                            return done(err);
                        }

                        // check to see if theres already a user with that email
                        if (user) {
                            done('That email is already taken.');
                        } else {
                            // if there is no user with that email
                            // create the user
                            var newUser            = new User();

                            // set the user's local credentials
                            newUser.local.email    = email;
                            newUser.local.password = newUser.generateHash(req.body.password);
                            newUser.username    = username;
                            newUser.firstName = firstName;
                            newUser.lastName = lastName;
                            newUser.activationKey = key;

                            if(count === 0) {
                                // first user gets superAdmin privileges and account
                                newUser.superAdmin = true;
                            }

                            // save the user
                            newUser.save(function(err) {
                                done(err, key, newUser);
                            });
                        }
                    });
                });
            },
            function(key, user, done) {
                if(!user.firstName)
                    user.firstName = user.local.email.substring(0, user.local.email.indexOf("@"));

                email.activateAccount({
                    email : user.local.email,
                    firstName : user.firstName,
                    activateUrl : 'http://' + req.headers.host + '/activate/' + key,
                    homeUrl : 'http://' + req.headers.host + '/'
                },
                function(err, responseStatus, html, text) {
                    if(err) {
                       return done(err);
                    }
                    done(err, user);
                });
            }
        ], function(err, user) {
            if (err) {
                req.flash('errorMessage', err);
                res.redirect('/signup');
                return;
            }
            req.flash('infoMessage',
                      'An e-mail has been sent to ' + user.local.email + ' with further instructions.');
            res.redirect('/signup/' + user._id);
        });
    });

    // show the activation form (can be used to request a resend of
    // the activation email)
    app.get('/signup/:id', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('activate.jade', {
            error: req.flash('errorMessage'),
            info: req.flash('infoMessage'),
            success: req.flash('successMessage')
        });
    });

    // process the activation form (resend the activation email)
    app.post('/signup/:id', function(req, res) {

        async.waterfall([
            function(done) {
                // find a user whose _id matches to obtain the activation token
                User.findById(req.params.id, function(err, user) {
                    // if there are any errors, return the error
                    if (err) {
                        return done(err);
                    }

                    // check to see if theres already a user with that email
                    if (!user) {
                        done('Sorry no user exists for your id. Please create a new account');
                    } else {
                        done(null, user.activationKey, user);
                    }
                });
            },
            function(key, user, done) {
                if(!user.firstName)
                    user.firstName = user.local.email.substring(0, user.local.email.indexOf("@"));

                email.activateAccount({
                    email : user.local.email,
                    firstName : user.firstName,
                    activateUrl : 'http://' + req.headers.host + '/activate/' + key,
                    homeUrl : 'http://' + req.headers.host + '/'
                },
                function(err, responseStatus, html, text) {
                    if(err) {
                       return done(err);
                    }
                    done(err, user);
                });
            }
        ], function(err, user) {
            if (err) {
                req.flash('errorMessage', err);
                res.redirect('/signup/');
                return;
            }
            req.flash('infoMessage',
                      'An e-mail has been resent to ' + user.local.email + ' with further instructions.');
            res.redirect('/signup/' + req.params.id);
        });
    });

    // process the activation email link
    app.get('/activate/:key', function(req, res) {
        User.findOne({
            'activationKey': req.params.key
        },
        function(err, user) {
            if (!user) {
                req.flash('errorMessage',
                          'Sorry the activation key is invalid, please create a new account.');
                return res.redirect('/signup');
            }
            req.flash('infoMessage', 'Please enter your login credentials to activate your account.');
            res.redirect('/verify/' + req.params.key);
        });
    });


    // verify the user associated with the id is the
    // authorised user
    app.get('/verify/:key', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('verify.jade', {
            error: req.flash('errorMessage'),
            info: req.flash('infoMessage'),
            success: req.flash('successMessage')
        });
    });

    // process the identity verification form (before activating the account)
    app.post('/verify/:key', function(req, res) {

        async.waterfall([
            function(done) {
                // find a user who matches the activation token
                User.findOne({
                    'activationKey': req.params.key
                },
                function(err, user) {
                    // if there are any errors, return the error
                    if (err) {
                        return done('Sorry the activation key is invalid, please create a new account.');
                    }

                    // the user is found check the email
                    if (user.username !== req.body.email.toLowerCase())
                        return done(invalidEmail);

                    // the user is found check the password
                    if (!user.validPassword(req.body.password))
                        return done(invalidPassword);

                    // Generate an api token
                    crypto.randomBytes(20, function(err, buf) {
                        user.apiToken = buf.toString('hex');
                        user.activationKey = undefined;

                        user.save(function(err) {
                            // The user is not logged in here to simplify
                            // the client login procedure. Forcing all login
                            // attempts through the app.post('/login') function
                            // means that api authentication has to be checked in
                            // only one place.
                            done(err, user);
                        });
                    });
                });
            },
            function(user, done) {
                if(!user.firstName)
                    user.firstName = user.local.email.substring(0, user.local.email.indexOf("@"));

                email.welcome({
                    email : user.local.email,
                    firstName : user.firstName,
                    homeUrl : 'http://' + req.headers.host + '/'
                },
                function(err, responseStatus, html, text) {
                    if(err) {
                       return done(err);
                    }
                    done(err, user);
                });
            }
        ], function(err, user) {
            if (err === invalidEmail) {
                req.flash('errorMessage', err.message);
                res.redirect('/verify/' + req.params.key);
            } else if (err === invalidPassword) {
                req.flash('errorMessage', err.message);
                res.redirect('/verify/' + req.params.key);
            } else if (err) {
                req.flash('errorMessage', err);
                res.redirect('/signup/');
            } else {
                req.flash('successMessage', "Your account has been activated, please login again to start");
                res.redirect('/login');
            }
        });
    });

    // =====================================
    // LOGIN ===============================
    // =====================================
    // show the login form
    app.get('/login', function(req, res) {

        if(req.isAuthenticated()){
            debug("user already logged in redirecting to index page");
            res.redirect('/');
        } else {
            debug("user not logged in rendering login page");
            // render the page and pass in any flash data if it exists
            res.render('login.jade', {
                error: req.flash('errorMessage'),
                info: req.flash('infoMessage'),
                success: req.flash('successMessage')
            });
        }
    });

    app.post('/login', function(req, res, next) {
        passport.authenticate('local-login', function(err, user, info) {
            if(err) {
                return next(err);
            }
            if(!user) {
                return res.redirect('/login');
            }
            if(user.activationKey) {
                req.flash('infoMessage', 'The account has not been activated yet!');
                return res.redirect('/signup/' + user._id);
            }
            req.login(user, function(err){
                if(err) {
                    return next(err);
                }

                // Check here for browser login or client login
                // If browser, send to main page, if client return
                // authentication tokens via the provided app URI.
                if(req.headers['X-Acorn-Platform'] || req.query.appscheme) {
                    user.save(function(err) {
                        if(err) {
                            return next(err);
                        }
                        var scheme = req.query.appscheme;
                        return res.redirect(scheme + '://authenticate?email_hash=' + user._id + '&token=' + user.apiToken);
                    });
                } else {
                    return res.redirect('/');
                }
            });
        })(req, res, next);
    });

    // =====================================
    // FORGOT PASSWORD =====================
    // =====================================
    // show the forgot password form
    app.get('/forgot', function(req, res) {

        // render the page and pass in any flash data if it exists
        res.render('forgot.jade', {
            error: req.flash('errorMessage'),
            info: req.flash('infoMessage'),
            success: req.flash('successMessage')
        });
    });

    // process the forgot password form
    app.post('/forgot', function(req, res, next) {
        async.waterfall([
            function(done) {
                crypto.randomBytes(20, function(err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function(token, done) {
                User.findOne({ 'local.email' : req.body.email }, function(err, user) {
                    if (!user) {
                        req.flash('errorMessage', 'No account with that email address exists.');
                        return res.redirect('/forgot');
                    }

                    user.local.resetPasswordToken = token;
                    user.local.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                    user.save(function(err) {
                        done(err, token, user);
                    });
                });
            },
            function(token, user, done) {
                if(!user.firstName)
                    user.firstName = user.local.email.substring(0, user.local.email.indexOf("@"));

                email.passwordReset({
                    email : user.local.email,
                    firstName : user.firstName,
                    resetUrl : 'http://' + req.headers.host + '/reset/' + token,
                    homeUrl : 'http://' + req.headers.host + '/'
                },
                function(err, responseStatus, html, text) {
                    if(err) {
                        console.log(err);
                       done(err);
                    }
                    req.flash('infoMessage',
                              'An e-mail has been sent to ' + user.local.email + ' with further instructions.');
                    done(err, 'done');
                });
            }
        ], function(err) {
            if (err) return next(err);
            res.redirect('/forgot');
        });
    });

    // process the email reset password link
    app.get('/reset/:token', function(req, res) {
        User.findOne({
            'local.resetPasswordToken': req.params.token,
            'local.resetPasswordExpires': { $gt: Date.now() }
        },
        function(err, user) {
            if (!user) {
                req.flash('errorMessage', 'Password reset token is invalid or has expired.');
                return res.redirect('/forgot');
            }
            res.render('reset', {
                user: req.user,
                error: req.flash('errorMessage'),
                info: req.flash('infoMessage'),
                success: req.flash('successMessage')
            });
        });
    });

    // process the reset password form
    app.post('/reset/:token', function(req, res) {
        async.waterfall([
            function(done) {
                User.findOne({
                    'local.resetPasswordToken': req.params.token,
                    'local.resetPasswordExpires': { $gt: Date.now() }
                },
                function(err, user) {
                    if (!user) {
                        req.flash('errorMessage', 'Password reset token is invalid or has expired.');
                        return res.redirect('/forgot');
                    }

                    if(req.body.password != req.body.confirm) {
                        req.flash('errorMessage', 'The passwords are not the same.');
                        return res.redirect('/reset/' + req.params.token);
                    }
                    user.local.password = user.generateHash(req.body.password);
                    user.local.resetPasswordToken = undefined;
                    user.local.resetPasswordExpires = undefined;

                    user.save(function(err) {
                        req.logIn(user, function(err) {
                            done(err, user);
                        });
                    });
                });
            },
            function(user, done) {
                if(!user.firstName)
                    user.firstName = user.local.email.substring(0, user.local.email.indexOf("@"));

                email.passwordChanged({
                    email : user.local.email,
                    firstName : user.firstName,
                    homeUrl : 'http://' + req.headers.host + '/'
                },
                function(err, responseStatus, html, text) {
                    if(err) {
                        console.log(err);
                       done(err);
                    }
                    req.flash('successMessage', 'Success! Your password has been changed.');
                    done(err);
                });
            }
        ], function(err) {
            res.redirect('/login');
        });
    });

    // =====================================
    // LOGOUT ==============================
    // =====================================
    app.get('/logout', function(req, res) {
        if(req.user)
            debug("user logged out:" + req.user.username);
        req.logout();
        res.redirect('/login');
    });


    // =====================================
    // VIEW Profile ========================
    // =====================================
    // show the login form
    app.get('/profile', function(req, res) {

        if(!req.isAuthenticated()){
            debug("user not logged in redirecting to login page");
            res.redirect('/login');
        } else {
            debug("user logged in rendering profile page");
            // render the page and pass in any flash data if it exists
            res.render('profile.jade', {
                error: req.flash('errorMessage'),
                info: req.flash('infoMessage'),
                success: req.flash('successMessage'),
                user : req.user
            });
        }
    });

    app.post('/profile', function(req, res, next){
        async.waterfall([
            function(done) {
                if(!req.body.firstName) {
                    done('A first name must be provided.');
                } else if(!req.body.lastName) {
                    done('A last name must be provided.');
                } else if(req.body.password && req.body.password != req.body.confirm) {
                    done('The passwords are not the same.');
                }
                done();
            },
            function(done) {
                var email = req.body.email.trim();
                var username = email.toLowerCase();
                var firstName = req.body.firstName.trim();
                var lastName = req.body.lastName.trim();

                // find a user whose _id matches the form
                User.findOne({ 'username' :  username }, function(err, user) {
                    // if there are any errors, return the error
                    if (err) {
                        return done(err);
                    }

                    // check to see if theres already a user with that email
                    if (user && !req.user._id.equals(user._id)) {
                        done(new Error('That email address is already in use!'));
                    } else {
                        // update the logged in user
                        req.user.local.email    = email;
                        if(req.body.password && req.body.password.length !== 0)
                            req.user.local.password = req.user.generateHash(req.body.password);
                        req.user.username    = username;
                        req.user.firstName = firstName;
                        req.user.lastName = lastName;

                        // save the user
                        req.user.save(function(err, user) {
                            done(err, user);
                        });
                    }
                });
            },
            function(user, done) {
                if(!user.firstName)
                    user.firstName = user.local.email.substring(0, user.local.email.indexOf("@"));

                email.profileUpdated({
                    email : user.local.email,
                    firstName : user.firstName,
                    homeUrl : 'http://' + req.headers.host + '/'
                },
                function(err, responseStatus, html, text) {
                    if(err) {
                       return done(err);
                    }
                    done(err, user);
                });
            }
        ], function(err, user) {
            if (err) {
                req.flash('errorMessage', err.message);
                res.redirect('/profile');
                return;
            }
            req.flash('infoMessage',
                      'An e-mail notification has been sent to ' + user.local.email + '. Press cancel to return to the main screen.');
            res.redirect('/profile');
        });
    });
};

// route middleware to make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the login page
    res.redirect('/login');
}
