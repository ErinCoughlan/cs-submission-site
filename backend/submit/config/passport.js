// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var User       = require('../models/user');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
    });



    passport.use('local-login', new LocalStrategy({
        usernameField: 'username',
        passwordField: 'password'
    }, function(username, password, done) {
        User.findOne({ 'local.username': username }, function (err, user) {
            if (err) { return done(err); }
            if (!user) {
                console.log('No such user');
                return done(null, false, { message: 'Incorrect username or password.' });
            }
            if (!user.validPassword(password)) {
                console.log("Bad password");
                return done(null, false, { message: 
                                           'Incorrect username or password.' });
            }
            return done(null, user);
        });
    }));
                                                  
    

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'


    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'username',
//        emailField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, username, password, done) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

            // find a user whose email is the same as the forms email
            // we are checking to see if the user trying to login already exists
            User.findOne({ 'local.username' :  username }, function(err, user) {
                // if there are any errors, return the error
                if (err)
                    return done(err);
                
                // check to see if theres already a user with that email
                if (user) {
                    console.log("User already exists");
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                } else {
                    
                    // if there is no user with that email
                    // create the user
                    var newUser            = new User();
                    
                    // set the user's local credentials
                    newUser.local.username = username;
                    newUser.local.email    = "placeholder@cs.hmc.edu";
                    newUser.local.password = newUser.generateHash(password);
                    
                    console.log("About to svae user");
                    // save the user
                    newUser.save(function(err) {
                        if (err) {
                            console.log("Couldn't save user");
                            throw err;
                        }
                        return done(null, newUser);
                    });
                }
                
            });    
            
        });
        
    }));
    
};
