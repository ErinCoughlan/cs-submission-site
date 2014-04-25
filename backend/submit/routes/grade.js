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
        var courseName         = req.params.course;
        var assignmentName     = req.params.assignments;
        var studentName        = req.params.student;
        var fileName           = req.params.file;

        // Hit the database for all the things we need to save this. Cry inside.
        Course.findOne({"name": courseName}, function(err, course) {
            if (err) {
                res.send("error getting course");
                return;
            }

            var assignments = course.assignments;

            var assignment;
            assignments.forEach(function(anAssignment) {
                if(anAssignment.name === assignmentName) {
                    assignment = anAssignment;
                }
            });

            if(!assignment) {
                console.log("Failed to find assignemnt by name");
                return;
            }
            
            Grader.find({"course_id": course._id, "name": graderUser.name},
                        function(err, grader) {
                            Student.find({"course_id": course.id,
                                          "name": studentName},
                                         function(err, student) {
                                             var file;

                                             // TODO: This way of checking equality is uberhacky
                                             student.files.forEach(function(aFile) {
                                                 if(assignments[aFile.assignment].name === assignmentName &&
                                                    course.files[aFile.template].name === fileName) {
                                                     file = aFile;
                                                 }
                                             });

                                         });
                        });
        });
    });



    // TODO validate that it's a grutor for the class
    app.get("/course/:course/assignment/:assignment/student/:student/file/:file/grade/info/", isLoggedIn, function(req, res) {
        var graderUser     = req.session.passport.user;
        var courseName     = req.params.course;
        var assignmentName = req.params.assignments;
        var studentName    = req.params.student;
        var fileName       = req.params.file;

        console.log(req.params);
        // Hit the database for all the things we need to save this. Cry inside.
        Course.findOne({"name": courseName}, function(err, course) {
            if (err) {
                res.send("error getting course");
                return;
            }

            var assignments = course.assignments;

            var assignment;
            assignments.forEach(function(anAssignment) {
                if(anAssignment.name === assignmentName) {
                    assignment = anAssignment;
                }
            });


            Grader.find({"course_id": course._id, "name": graderUser.name},
                        function(err, grader) {
                            Student.findOne({"course_id": course.id,
                                          "name": studentName},
                                         function(err, student) {


                                             var file;
                                             console.log(student);

                                             student.files.forEach(function(aFile) {
                                                 if(assignments[aFile.assignment].name === assignmentName &&
                                                    course.files[aFile.template].name === fileName) {
                                                     file = aFile;
                                                 }
                                             });
                                             if(!file) {
                                                 file = {"name": fileName}
                                             }
                                             data = {
                                                 "file": file,
                                                 "student": student,
                                                 "course": course,
                                                 "grader": grader
                                             }

                                             res.json(data);
                                         });
                        });
        });
    });

    // TODO validate that it's a grutor for the class
    app.get("/course/:course/assignment/:assignment/student/:student/file/:file/grade/", isLoggedIn, function(req, res) {
        res.render("grade", {
          'course': req.params.course,
          'assignment': req.params.assignment,
          'student': req.params.student,
          'file': req.params.file
        });
      });

    app.get("/grade/", isLoggedIn, function(req, res) {
        res.render("grade");
    });

};


function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't, redirect them to the home page
    res.redirect('/');
}
