
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var frontBase = __dirname + '/../../frontend/';

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(frontBase, 'html'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(frontBase));

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
    res.render('index');
});
app.get('/cs5', function(req, res){
    res.render('student');
});



http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});
