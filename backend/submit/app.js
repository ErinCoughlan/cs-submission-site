
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
var Student    = require('./models/student.js');
var Course     = require('./models/course.js');
var Assignment = require('./models/assignment.js');
var Submission = require('./models/submission.js');
var File       = require('./models/file.js');
var FileTemplate = require('./models/fileTemplate.js');

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
                "owner": "533abdaee4b09d8a1148b087",
                "course": "531ea533e4b0ea5911efe9f6",
                "grade": null,
                "name": template.name,
                "gradedBy": null,
                "partner": null,
                "studentComments": null,
                "graderComments": null,
                "submissions": []
            };
            console.log(file);
            new File(file).save(file);
        });
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


app.get('/grader/course/:course', isLoggedIn, function(req, res) {
    res.render('grader');
});

app.get('/students/:course', isLoggedIn, function(req, res) {
    var courseid = req.params.course;
    Course.findOne({"name": courseid}, function(err, course) {        
        // Find all matching students
        if(err) {
            res.send("error getting course");
            return;
        }
        
        Student.find({"course_id": course._id}, function(err, students) {
            if(err) {
                res.send("error getting students");
                return;
            }
            // TODO unhardcode
            students[0].name = "Zach Dodds";
            console.log(students);
            var data = { 'students' : students };
            res.json(data);
        });
    });
});

app.get('/grade', isLoggedIn, function(req, res) {
    res.render('grade');
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
        
        console.log("Course contents: ", course);
        var assignments = course.assignments;
        var data = {
            'course': course, 
            'assignments': assignments
        };
        
        res.json(data);
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
        
        var assignment;
        
        course.assignments.forEach(function(anAssignment) {
            if(anAssignment.name === assignmentname) {
                assignment = anAssignment;
            }
        });
        
        if(!assignment) {
            console.log("No matching assignment found");
            return;
        }
        
        
        
        Student.findOne({"course_id": course._id}, function(err, student) {
            var combined_files = new Array();
            var index = 0;
            assignment.files.forEach(function(template) {
                file = student.files[index];
                if(file) {
                    combined_files.push({
                        "name": template.name, 
                        "maxScore": template.maxScore,
                        "grade": file.grade,
                        "submissions": file.submissions,
                        "studentComments": file.studentComments,
                        "graderComments": file.graderComments
                    });
                }  else {
                    combined_files.push({
                        "name": template.name, 
                        "maxScore": template.maxScore
                    });
                }

                index += 1;                                    
            });

            console.log(combined_files);
            
            var data = {
                'students': student,
                'course': course,
                'assignment': assignment,
                'files': combined_files
            };
            
            
            res.json(data);
        });
    });
});


// json route for assignment info
app.get('/grader/course/:course/assignment/:assignment', isLoggedIn, function(req, res) {
    var userid = req.session.passport.user;
    var coursename = req.params.course;
    var assignmentname = req.params.assignment;
    
    Course.findOne({"name": coursename}, function(err, course) {
        if(err) {
            res.send("Error getting course");
            return;
        }
        
        var assignment;
        
        course.assignments.forEach(function(anAssignment) {
            if(anAssignment.name === assignmentname) {
                assignment = anAssignment;
            }
        });
        
        if(!assignment) {
            console.log("No matching assignment found");
            return;
        }
        
        
        
        Student.find({"course_id": course._id}, function(err, students) {
            var combined_files = new Array();
            assignment.files.forEach(function(foo) {
                combined_files.push([]);
            });
            

            students.forEach(function(student) {
                var index = 0;
                assignment.files.forEach(function(tenplate) {
                    file = student.files[index];
                    if(file) {
                        combined_files[0].push({
                            "student": student.name,
                            "name": template.name, 
                            "maxScore": template.maxScore,
                            "grade": file.grade,
                            "submissions": file.submissions,
                            "studentComments": file.studentComments,
                            "graderComments": file.graderComments
                        });
                    }  else {
                        combined_files[0].push({
                            "student": student.name,
                            "name": template.name, 
                            "maxScore": template.maxScore
                        });
                    }

                    index += 1;                                    
                });

                
            });

            console.log(combined_files);
            
            var data = {
                'students': students,
                'course': course,
                'assignment': assignment,
                'files': combined_files
            };
            
            
            res.json(data);
        });
    });
});


// json route for downloading submissions
app.get('/course/:course/assignment/:assignment/file/:file/submit/', isLoggedIn, function(req, res) {
    var userid         = req.session.passport.user;
    var coursename     = req.params.course;
    var assignmentname = req.params.assignment;
    var filename       = req.params.file;

    // get the course
    Course.findOne({"name":coursename}, function(err, retrievedCourse) {
        if(err) {
            res.send("Error getting course");
            return;
        }

        var course = retrievedCourse;

        // Get the current user's student object for the current course
        Student.findOne({"user_id":userid, "course_id":course._id}, function(err, retrievedStudent) {
            if(err) {
                res.send("Error getting student");
                return;
            }

            var student = retrievedStudent;

            // get the correct assignment
            var assignment;
            course.assignments.forEach(function(anAssignment) {
                if(anAssignment.name === asignmentname) {
                    assignment = anAssignment;
                }
            });

            if(!assignment) {
                console.log("Failed to get assignment");
                return;
            }
            
            // Get the relevant file
            // TODO catch edge case if assignment changes while this might be being used.
            // Generally, assignments won't be being modified when we try to grab files,
            // so the new-file-creation for all students should be safe usually.
            console.log(student._id, assignment._id);
            
            var file = retrievedFile;
                
            // Get the relevant submission (the last added, i.e. most recently submitted)
            var submission = file.submissions[file.submissions.length - 1];
            
            console.log("location", submission);
            var readStream = fs.createReadStream(
                submission.document);
            readStream.pipe(res);
        });
    });
});

// recieve file uploads
app.post('/course/:course/assignment/:assignment/', isLoggedIn, function(req,res) {
    console.log(req.files);
    console.log(req.body);
    var coursename     = req.params.course;
    var assignmentid = req.params.assignment;
    var userid = req.session.passport.user;
    var submission = new Submission();

    var form = new multiparty.Form();
    form.parse(req, function(err, fields, files) {
        console.log("fields", fields);
        console.log("files", files);
        Object.keys(files).forEach(function(key, i) {
            var file = files[key][0];
            var filename = file.fieldName;
            console.log("fileid", filename);
            // TODO: copy the file to a better location
            var new_file = path.join(__dirname, "files", (new Date()).getTime().toString());
            copyFile(file.path, new_file, function(err){
                // make a submission schema
                var submission = new Submission({
                    "document": new_file,
                    "date":new Date().toJSON()
                });
                console.log(submission);
                // save to mongo
                submission.save(function (err) {
                    console.log(err);
                    console.log(new_file, submission);

                    // Get the current course
                    Course.findOne({"name":coursename}, function(err, retrievedCourse) {
                        if(err) {
                            res.send("Error getting course");
                            return;
                        }

                        var course = retrievedCourse;
                        console.log(course._id);


                        // Get the current user's student object for this course
                        Student.findOne({"user_id":userid, "course_id":course._id}, function(err, retrievedStudent) {
                            if(err) {
                                res.send("Error getting student");
                                return;
                            }

                            var student = retrievedStudent;
                            console.log(student._id);

                            // get the correct assignment
                            Assignment.findOne({"_id": assignmentid},
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
                                                   File.findOne({"assignment": assignment._id, "name": filename, "owner": student._id}, function(err, retrievedFile) {
                                                       if(err) {
                                                           res.send("Error getting file");
                                                           return;
                                                       }

                                                       retrievedFile.submissions.push(submission._id);
                                                       var comment = JSON.parse(fields.comments[0])[key];
                                                       console.log("comment", comment);
                                                       retrievedFile.studentComments = comment;
                                                       console.log("about to save file");
                                                       retrievedFile.save();

                                                   });
                                               });
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
        var user = req.user;
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
    var user = req.user;
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
