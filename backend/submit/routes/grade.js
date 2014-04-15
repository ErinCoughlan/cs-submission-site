/*global require, module */

var Course = require('../models/course');
var Grader = require('../models/grader');
var Assignment = require('../models/assignment');
var Student = require('../models/student');
var FileTemplate = require('../models/fileTemplate');
var File = require('../models/student');

module.exports = function(app, passport) {
    app.get('/cs5', isLoggedIn, function(req, res) {
        res.render('student');
    });


    // TODO validate that it's a grutor for the class
    app.post("/course/:course/assignment/:assignment/student/:student/file/:file/grade", isLoggedIn, function(req, res) {
        var graderUser         = req.session.passport.user;
        var courseName     = req.params.course;
        var assignmentNumber = req.params.assignments;
        var studentName    = req.params.student;
        var fileNumber       = req.params.file;

        // Hit the database for all the things we need to save this. Cry inside.
        Course.findOne({"name": courseName}, function(err, course) {
            if (err) {
                res.send("error getting course");
                return;
            }
            
            var assignments = course.assignments;

            // TODO this will break if an assignment is deleted (not sure if it
            // matters, arguably then we should just never see this page anyway)
            var assignment = course.assignments[assignmentNumber];

            Grader.find({"course_id": course._id, "name": graderUser.name}, 
                        function(err, grader) {
                            Student.find({"files": {$exists: true}, "course_id": course.id,
                                          "name": studentName}, 
                                         function(err, student) {
                                             var file;
                                             student.files.forEach(function(aFile) {
                                                 if(aFile.assignment == assignmentNumber &&
                                                    aFile.template == fileNumber) {
                                                     file = aFile;
                                                 }
                                             });
                                             
                                         });
                        });
        });
    });



    // TODO validate that it's a grutor for the class
    app.get("/course/:course/assignment/:assignment/student/:student/file/:file/grade/info/", isLoggedIn, function(req, res) {
        var graderUser         = req.session.passport.user;
        var courseName     = req.params.course;
        var assignmentNumber = req.params.assignments;
        var studentName    = req.params.student;
        var fileNumber       = req.params.file;

        // Hit the database for all the things we need to save this. Cry inside.
        Course.findOne({"name": courseName}, function(err, course) {
            if (err) {
                res.send("error getting course");
                return;
            }
            
            var assignments = course.assignments;

            // TODO this will break if an assignment is deleted (not sure if it
            // matters, arguably then we should just never see this page anyway)
            var assignment = course.assignments[assignmentNumber];

            Grader.find({"course_id": course._id, "name": graderUser.name}, 
                        function(err, grader) {
                            Student.find({"files": {$exists: true}, "course_id": course.id,
                                          "name": studentName}, 
                                         function(err, student) {
                                             var file;
                                             student.files.forEach(function(aFile) {
                                                 if(aFile.assignment == assignmentNumber &&
                                                    aFile.template == fileNumber) {
                                                     file = aFile;
                                                 }
                                             });

                                             data = {
                                                 "file": file,
                                                 "student": student,
                                                 "course": course,
                                                 "grader": grader
                                             }
                                             
                                         });
                        });
        });
    });


});


function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't, redirect them to the home page
    res.redirect('/');
}

