
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

var frontBase = __dirname + '/../../frontend/';

// Config mongoose
var mongoose = require('mongoose');
var configDB = require('./config/database.js');
mongoose.connect(configDB.url);

// Login configuration
var passport = require('passport');

var User = require('./models/user.js');
var Course = require('./models/course.js');
var Assignment = require('./models/assignment.js');
var Submission = require('./models/submission.js');

// Configuration to handle the removal of req.flash
var app = express();
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

//routes
app.get('/', function(req, res){
    res.render('index');
});

app.post('/login',
  passport.authenticate('local-login', { successRedirect: '/cs5',
                                   failureRedirect: '/',
                                   failureFlash: true })
);

app.get('/cs5', isLoggedIn, function(req, res){
    res.render('student');
});

// json route for course info
app.get('/assignments/:course', isLoggedIn, function(req, res){
    var userid = req.session.passport.user;
    var courseid = req.params.course;
    console.log("got request for course", req.params, "from", req.session);
    Course.findById(courseid, function ( err, course){
        console.log("sending", course);
        if(err) {
            res.send("Error getting list of assignments.");
            return;
        }
        res.send(course);
    });
});

// json route for assignment info
app.get('/assignment/:assignment', isLoggedIn, function(req, res){
    var userid = req.session.passport.user;
    var assignmentid = req.params.assignment;
    console.log("got request for assignment", req.params, "from", req.session);
    Assignment.findById(assignmentid, function ( err, assignment){
        console.log("sending", assignment);
        if(err) {
            res.send("Error getting assignment.");
            return;
        }
        res.send(assignment);
    });
});

// json route for downloading submissions
app.get('/submission/:submission', isLoggedIn, function(req, res){
    var userid = req.session.passport.user;
    var submissionid = req.params.submission;
    console.log("got request for submission", req.params, "from", req.session);
    Submission.findById(submissionid, function ( err, submission){
        console.log("sending", submission);
        if(err) {
            res.send("Error getting assignment.");
            return;
        }
        // actually send the file
        res.send(submission.location);
    });
});

// TODO make this, you know, actually submit
app.post('/submit', isLoggedIn, function(req,res) {
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


// make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't, redirect them to the home page
    res.redirect('/');
}

// TODO remove this, it's only here so I can add an account
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
app.get('/signup', function(req, res) {
        // render the page and pass in any flash data if it exists
    res.render('signup', { message: req.flash('signupMessage') });
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
