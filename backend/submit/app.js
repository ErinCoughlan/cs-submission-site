
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

// file uploading
var multiparty = require('multiparty');
var util = require('util');
var path = require('path');
var fs = require('fs');

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
app.use(express.json());       // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

//routes
app.get('/', function(req, res){
    res.render('index');
});

app.post('/login',
         passport.authenticate('local-login', { successRedirect: '/cs5',
                                               failureRedirect: '/',
                                               failureFlash: true })
        );

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.get('/cs5', isLoggedIn, function(req, res) {
    res.render('student');
});

app.get('/grade', isLoggedIn, function(req, res) {
    res.render('grade');
});

// json route for course info
app.get('/assignments/:course', isLoggedIn, function(req, res) {
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
app.get('/assignment/:assignment', isLoggedIn, function(req, res) {
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
app.get('/submission/:submission', isLoggedIn, function(req, res) {
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
        var readStream = fs.createReadStream(submission.location);
        readStream.pipe(res);
    });
});

// recieve file uploads
app.post('/submit/:assignment', isLoggedIn, function(req,res) {
    console.log(req.files);
    console.log(req.body);
    var assignmentid = req.params.assignment;
    var userid = req.session.passport.user;
    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
        console.log("fields", fields);
        console.log("files", files);
        Object.keys(files).forEach(function(key) {
            var file = files[key][0];
            var fileid = file.fieldName;
            // make a submission schema
            var submission = new Submission();
            // TODO: copy the file to a better location
            var new_file = path.join(__dirname, "files", (new Date()).getTime().toString());
            copyFile(file.path, new_file);
            submission.location = new_file;
            submission.date = new Date().toJSON();
            // save to mongo
            submission.save(function (err) {
                console.log(err);
            });
            console.log(submission);
            // update the assignment object to be aware of the submission
            Assignment.findById(assignmentid, function ( err, assignment){
                console.log("assignment", assignment);
                if(err) {
                    res.send("Error getting assignment to associate file with.");
                    return;
                }
                var assignment_file = assignment.files.filter(function(f){
                    console.log("f", f)
                    return f.id == fileid
                })[0];
                console.log(assignment_file.submissions)
                assignment_file.submissions.push({
                    id: submission._id,
                    date: submission.date
                });
                assignment.save(function (err) {
                    console.log(err);
                });
            });
        });
        var comments = JSON.parse(fields.comments[0]);
        Object.keys(comments).forEach(function(key) {
            var comment = comments[key];
            var fileid = key;
            // update the assignment object to be aware of the comment
            Assignment.findById(assignmentid, function ( err, assignment){
                console.log("assignment", assignment);
                if(err) {
                    res.send("Error getting assignment to associate file with.");
                    return;
                }
                var assignment_file = assignment.files.filter(function(f){
                    console.log("f", f)
                    return f.id == fileid
                })[0];
                assignment_file.comment = comment;
                assignment.save(function (err) {
                    console.log(err);
                });
            });
        });
    });
    res.send("good");
});

// make sure a user is logged in
function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't, redirect them to the home page
    res.redirect('/');
}

// Make this whole mechanism less sketch
app.post('/changemail', function(req, res) {
    console.log("Changing your email");
    if(req.isAuthenticated()) {
        user = req.user;
        user.local.email = req.body.email;
        console.log(user);
        user.save(function(err) {
            if(err) {
                console.log("Error saving user email");
                throw err;
            }
        });
    }
    res.redirect('/cs5');
});

app.post('/changepw', isLoggedIn, function(req, res) {
    user = req.user;
    // TODO HOLY SHIT WE ARE POSTING PLAINTEXT PASSWORDS FIXME
    pw = req.body.password;
    console.log(pw);
    user.local.password = user.generateHash(pw);
    user.save(function(err) {
        if(err) {
            console.log("Error saving user password");
            throw err;
        }
    });
    res.redirect('/cs5');
});

app.get('/settings', isLoggedIn, function(req, res) {
    res.render('settings');
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

// copy a file
function copyFile(source, target, cb) {
    var cbCalled = false;

    var rd = fs.createReadStream(source);
    rd.on("error", function(err) {
        done(err);
    });
    var wr = fs.createWriteStream(target);
    wr.on("error", function(err) {
        done(err);
    });
    wr.on("close", function(ex) {
        done();
    });
    rd.pipe(wr);

    function done(err) {
        if (!cbCalled) {
            if(cb){
                cb(err);
            }
            cbCalled = true;
        }
    }
}

// development only
if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on port ' + app.get('port'));
});
