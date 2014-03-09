
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
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/user.js');

// Configuration to (among other things) handle the removal of req.flash
var app = express()
app.use(flash()); // use connect-flash for flash messages stored in session

passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
  },
  function(username, password, done) {
    User.findOne({ username: username }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username or password.' });
      }
      if (!user.validPassword(password)) {
        return done(null, false, { message: 'Incorrect username or password.' });
      }
      return done(null, user);
    });
  }
));


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
  passport.authenticate('local', { successRedirect: '/cs5',
                                   failureRedirect: '/',
                                   failureFlash: true })
);



http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
