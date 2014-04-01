
/*global require, __dirname, console, process */

/**
 * Module dependencies.
 */

// Must come before requiring express
var flash = require('connect-flash');

var express = require('express');
var http = require('http');
var path = require('path');
var _ = require('underscore');

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

var User       = require('./models/user.js');
var Course     = require('./models/course.js');
var Assignment = require('./models/assignment.js');
var Submission = require('./models/submission.js');
var File       = require('./models/file.js');
var FileTemplate = require('./models/fileTemplate.js')

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
var routes = require('./routes/routes')(app, passport);

app.get('/', function(req, res){
    res.render('index');
});

// create file documents from fileTemplates. hardcoded to testuser.
// running this will create duplicates.
app.get('/filesfromtemplates', function(req, res){
    FileTemplate.find({}, function(err, templates){
      templates.forEach(function(template){
        var file = {
            "assignment": template.assignment,
            "template": template._id,
            "grade": null,
            "gradedBy": null,
            "owner": {
                "$oid": "533abdaee4b09d8a1148b087"
            },
            "partner": null,
            "studentComments": null,
            "graderComments": null,
            "course": {
                "$oid": "531ea533e4b0ea5911efe9f6"
            },
            "submissions": []
        }
        console.log(file)
        new File(file).save(file)
      })
    });
    res.send('ok');
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


app.get('/grader', isLoggedIn, function(req, res) {
    res.render('grader');
});

// json route for course info
app.get('/assignments/:course', isLoggedIn, function(req, res) {
    var userid = req.session.passport.user;
    var courseid = req.params.course;
    console.log("got request for course", req.params, "from", req.session);
    
    Course.findOne({'name': courseid}, function (err, course) {
        console.log("sending", courseid);
        if(err) {
            res.send("Error getting list of assignments.");
            return;
        }

        Assignment.find({"_id": {$in: course.assignments}} , function(err, assignments) {
            var myArr = {
                'course': course,
                'assignments': assignments
            }
            res.json(myArr);
         });
    });
});

// json route for assignment info
app.get('/course/:course/assignment/:assignment', isLoggedIn, function(req, res) {
    var userid = req.session.passport.user;
    var coursename = req.params.course;
    var assignmentname = req.params.assignment;

    Course.findOne({"name": coursename}, function(err, course) { 
        if(err) { 
            res.send("Error getting course");
            return;
        } 

        Assignment.findOne({"name": assignmentname}, function (err, assignment) {
            File.find({"template": {$in: assignment.files.toObject()}} , function(err, files) {
                FileTemplate.find({"_id": {$in: assignment.files.toObject()}}, function(err, fileTemplates) {
                    console.log(err, fileTemplates)
                    // combine the file and filetemplate
                    var combined_files = _.map(files, function(file){
                        var template = _.find(fileTemplates, function(ft){
                            return ft._id.toString() === file.template.toString()
                        });
                        console.log("template", template, "file", file)
                        // now add whatever properties are needed from either
                        return {"name": template.name, 
                                "maxScore": template.maxScore,
                                "grade": file.grade,
                                "studentComments": file.studentComments,
                                "graderComments": file.graderComments};
                    });
                    var data = {
                        'course': course,
                        'assignment': assignment,
                        'files': combined_files
                    }
                    res.json(data);
                });
            });
        });
    });
});


// json route for downloading submissions
app.get('/course/:course/assignment/:assignment/file/:file/submit/', isLoggedIn, function(req, res) {
    var userid         = req.session.passport.user;
    var courseName     = req.params.course;
    var assignmentName = req.params.assignment;
    var fileName       = req.params.file;
    
    // get the course
    Course.findOne({"name":coursename}, function(err, retirevedCourse) {
        if(err) {
            res.send("Error getting course");
            return;
        }

        course = retrievedCourse;
        res.send(course);

        // Get the current user's student object for the current course
        Student.findOne({"user_id":userid._id, "course_id":course._id}, function(err, retrievedStudent) {
            if(er) {
                res.send("Error getting student");
                return;
            }

            var student = retrievedStudent;
            res.send(student);
            
            // get the correct assignment
            Assignment.findOne({"course_id": course._id, "name": courseName}, 
                function(err, retrievedAssignment) {
                    if(err) {
                        res.send("Error getting assignment");
                        return;
                    }

                    var assignment = retrievedAssignment;
                    res.send(assignment);
                    
                    // Get the relevant file 
                    // TODO catch edge case if assignment changes while this might be being used.
                    // Generally, assignments won't be being modified when we try to grab files,
                    // so the new-file-creation for all students should be safe usually.
                    File.findOne({"course": course._id, "owner": student._id,
                                  "assignment": assignment.id_}, function(err, retrievedFile) { 
                                      if(err) {
                                          res.send("Error getting file");
                                          return;
                                      }

                                      var file = retrievedFile;
                                      
                                      // Get the relevant submission
                                      Submission.findById(file.submissions[
                                          file.submissions.length - 1], function(err, retrSub) {
                                              if(err) {
                                                  res.send("error getting submission");
                                                  return;
                                              }

                                              var submission = retrSub;
                                              res.send(submission);
                                             
                                              // send the file
                                              var readStream = fs.createReadStream(
                                                  submission.location);
                                              readStream.pipe(res);
                                          });
                                  });
                });

        });
    });
});
 

 
// recieve file uploads
app.post('/course/:course/assignment/:assignment/', isLoggedIn, function(req,res) {
    console.log(req.files);
    console.log(req.body);
    var courseid     = req.params.course;
    var assignmentid = req.params.assignment;
    var userid = req.session.passport.user;
    var submission = new Submission();
    
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

            // Get the current course
            Course.findOne({"name":coursename}, function(err, retirevedCourse) {
                if(err) {
                    res.send("Error getting course");
                    return;
                }

                course = retrievedCourse;
                res.send(course);
                

                // Get the current user's student object for this course
                Student.findOne({"user_id":userid._id, "course_id":course._id}, function(err, retrievedStudent) {
                    if(er) {
                        res.send("Error getting student");
                        return;
                    }
                    
                    var student = retrievedStudent;
                    res.send(student);
                    
                    // get the correct assignment
                    Assignment.findOne({"course_id": course._id, "name": courseName}, 
                       function(err, retrievedAssignment) {
                           if(err) {
                               res.send("Error getting assignment");
                               return;
                           }
                           
                           var assignment = retrievedAssignment;
                           res.send(assignment);
                           
                           // Get the correct file for this assignment
                           // TODO catch edge case if assignment changes while this might be being used.
                           // Generally, assignments won't be being modified when we try to grab files,
                           // so the new-file-creation for all students should be safe usually.
                           File.findOne({"course": course._id, "owner": student._id,
                                         "assignment": assignment._id, "name": fileid}, function(err, retrievedFile) { 
                                             if(err) {
                                                 res.send("Error getting file");
                                                 return;
                                             }
                                             
                                             
                                             retrievedFile.submissions.push(file._id);
                                             retrievedFile.comment = comments[key];
                                             retrievedFile.save();
                                                 
                                         });
                       });
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
    var pw = req.body.password;
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
