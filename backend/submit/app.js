
/*global require, __dirname */

/**
 * Module dependencies.
 */

// Must come before requiring express
var flash = require('connect-flash');

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

// Config mongoose
var mongoose = require('mongoose');
var configDB = require('./config/database.js');
mongoose.connect(configDB.url);



var frontBase = __dirname + '/../../frontend/';

// Login configuration
var passport = require('passport');

var User = require('./models/user.js');

// Configuration to handle the removal of req.flash
var app = express()
app.use(flash()); // use connect-flash for flash messages stored in session


// configure passport stuff
require('./config/passport')(passport);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(frontBase, 'html'));
app.set('view engine', 'jade');
app.use(express.static(frontBase));
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session({ secret: 'more secrets' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);

// sketcy createdb route
app.post('/createdb', function(req, res) {
    nano.db.create(req.body.dbname, function(err) {
        // Create db
        if(err) {
            res.sent("Error creating db " + req.body.dbname);
            return;
        }
        res.sent("Database " + req.body.dbname + " was created successfully");
    });
});

// TODO make this, you know, actually submit
app.post('/submit', function(req,res) {
    var name = req.body.name;
    var assignment = req.body.assignment;
    var file = req.body.file;

    db.insert({name:name, assignment:assignment, file:file}, file, function(err,body,header) {
        if(err) {
            res.send("Error creating or modifying submission");
            return;
        }

        res.send("Submission successful");
    });
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', function(req, res){
    res.render('index')
});
app.get('/cs5', function(req, res){
    res.render('student');
});
app.post('/login',
  passport.authenticate('local-login', { successRedirect: '/cs5',
                                   failureRedirect: '/',
                                   failureFlash: true })
);

app.post('/changemail', function(req, res) {
    if(req.isAuthenticated()) {
        user = req.user;
        user.email = req.email;
        
        user.save(function(err) {
            if(err) {
                console.log("Error saving user email");
                throw err;
            }
            return done(null, user);
        });
    }
});
         
app.post('/signup', passport.authenticate('local-signup', {
    successRedirect : '/', // redirect to the secure profile section
    failureRedirect : '/signup', // redirect back to the signup page if there is an error
    failureFlash : true // allow flash messages
}));

// TODO remove this, it's only here so I can add an account

app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
    res.render('signup', { message: req.flash('signupMessage') });
});

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
