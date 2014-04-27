/*global require, module */

var Course = require('../models/course');
var Grader = require('../models/grader');
var Assignment = require('../models/assignment');
var Student = require('../models/student');
var FileTemplate = require('../models/fileTemplate');
var File = require('../models/student');
var Helpers = require('../helpers');

// TODO: All these functions should make sure the current user is a grutor
module.exports = function(app, passport) {
    app.get("/grader/course/:course", isLoggedIn, function(req, res) {
        res.render("grader");
    });

    app.post("/course/:course/assignment/:assignment/student/:student/file/:file/grade", isLoggedIn, function(req, res) {
        var graderUser         = req.session.passport.user;
        var courseName         = req.params.course;
        var assignmentName     = req.params.assignments;
        var studentName        = req.params.student;
        var fileName           = req.params.file;

        // Grab the course for this file
        Course.findOne({"name": courseName}, function(err, course) {
            if (err) {
                res.send("error getting course");
                return;
            }

            var assignments = course.assignments;

            var assignment = Helpers.assignmentWithName(assignmentName, assignments);



            if(!assignment) {
                console.log("Failed to find assignemnt by name");
                return;
            }

            Grader.find({"course_id": course._id, "name": graderUser.name},
                        function(err, grader) {
                            Student.find({"course_id": course.id, "name": studentName},
                                         function(err, student) {
                                             var file = Helpers.fileInAssignmentWithName(
                                                 assignments,
                                                 assignmentName,
                                                 files,
                                                 fileName
                                             );

                                             // TODO: actually save the grade
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

            var assignment = Helpers.assignmentWithName(assignmentName, assignments);

            // TODO: check for null assignment.

            Grader.find({"course_id": course._id, "name": graderUser.name},
                        function(err, grader) {
                            Student.findOne({"course_id": course.id, "name": studentName},
                                            function(err, student) {
                                                var file = Helpers.fileInAssignmentWithName(
                                                    assignments,
                                                    assignmentName,
                                                    files,
                                                    fileName
                                                );


                                                if(!file) {
                                                    file = {"name": fileName};
                                                }

                                                data = {
                                                    "file": file,
                                                    "student": student,
                                                    "course": course,
                                                    "grader": grader
                                                };

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


    // Route to get all a student's stuff for a given course
    app.get("/grader/course/:course/student/:student/", function(req,res) {
        var courseName = req.params.course;
        var studentName = req.params.student;

        Course.findOne({"name": courseName}, function(err, course) {

            Student.findOne({"name": studentName, "course_id": course._id}, function(err, student) {

                var data = {
                    "course": course,
                    "student": student,
                    "files": student.files
                };

                res.json(data);
            });
        });
    });

    // json route for downloading submissions
    app.get("/course/:course/assignment/:assignment/file/:file/submit/", isLoggedIn, function(req, res) {
        var userid = req.session.passport.user;
        var coursename = req.params.course;
        var assignmentname = req.params.assignment;
        var filename = req.params.file;

        // get the course
        Course.findOne({
            "name": coursename
        }, function(err, retrievedCourse) {
            if (err) {
                res.send("Error getting course");
                return;
            }

            var course = retrievedCourse;

            // Get the current user"s student object for the current course
            Student.findOne({
                "user_id": userid,
                "course_id": course._id
            }, function(err, retrievedStudent) {
                if (err) {
                    res.send("Error getting student");
                    return;
                }

                var student = retrievedStudent;

                // get the correct assignment
                var assignment = Helpers.assignmentWithName(assignmentName, course.assignments);

                if (!assignment) {
                    console.log("Failed to get assignment");
                    return;
                }

                // Get the relevant file
                // TODO catch edge case if assignment changes while this might be being used.
                // Generally, assignments won"t be being modified when we try to grab files,
                // so the new-file-creation for all students should be safe usually.
                console.log(student._id, assignment._id);

                var file = retrievedFile;

                // Get the relevant submission (the last added, i.e. most recently submitted)
                var submission = file.submissions[file.submissions.length - 1];

                console.log("location", submission);
                var readStream = fs.createReadStream(
                    submission.document);
                // set the actual file name and extension. can't do that now because the database doesn't work.
                res.setHeader("Content-disposition", "attachment; filename=fakename.fakeext");
                readStream.pipe(res);
            });
        });
    });

};


function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't, redirect them to the home page
    res.redirect('/');
};
