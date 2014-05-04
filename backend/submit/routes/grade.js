/*global require, module */
/*jshint multistr: true */

var Course = require('../models/course');
var Grader = require('../models/grader');
var Assignment = require('../models/assignment');
var Submission = require('../models/submission');
var Student = require('../models/student');
var FileTemplate = require('../models/fileTemplate');
var File = require('../models/file');
var Helpers = require('../helpers');


// TODO: All these functions should make sure the current user is a grutor for
//       the given course. I recommend a function like isLoggedIn, but that
//       takes a course as well.
module.exports = function(app, passport) {
    app.get("/grader/course/:course", isLoggedIn, function(req, res) {
        res.render("grader");
    });

    /* TODO: There is a huge amount of code duplication between this route and
     *       the get to /course/.../assignment/.../student.../file/.../grade/info.
     *       The code should really, really, really be refactored to split these
     *       into reusable helpers.
     */
    app.post("/course/:course/assignment/:assignment/student/:student/file/:file/grade", isLoggedIn, function(req, res) {
        var graderUserId       = req.session.passport.user;
        var courseName         = req.params.course;
        var assignmentName     = req.params.assignment;
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
                console.log("Failed to find assignemnt " + assignmentName + " by name");
                return;
            }

            // Get correct grader object for currently logged in user.
            Grader.findOne({"course_id": course._id, "user_id": graderUserId},
                function(err, grader) {

                   // Get student currently being graded
                   Student.findOne({"course_id": course.id, "name": studentName},
                      function(err, student) {
                        var templateIndex = Helpers.fileInAssignmentWithName(
                                              assignment,
                                              fileName
                                            );


                        var fileIndex = Helpers.fileInStudentWithNumber(
                                                student.files,
                                                course.assignments,
                                                assignment,
                                                templateIndex
                                             );

                       // If the student doesn't have a file object corresponding
                       // to this template (e.g. they never submitted), create
                       // the file.
                       if(fileIndex < 0) {
                         var file = new File();
                         file.assignment =
                         Helpers.getAssignmentIndex(assignmentName,
                           assignments);
                         file.template    = templateIndex;
                         file.course      = course._id;
                         file.submissions = [];
                         student.files.push(file);
                         fileIndex = student.files.length - 1;
                       }


                       // Set graded information
                       student.files[fileIndex].gradedBy       = grader._id;
                       student.files[fileIndex].gradedByName   = grader.name;
                       student.files[fileIndex].grade          = req.body.grade;
                       student.files[fileIndex].graderComments = req.body.graderComments;

                       // Save student's new array.
                       student = Helpers.updateStudentFiles(student);

                       // TODO: Ultimately, this should probably be /, not /home
                       res.redirect('/home');
                   });
              });
        });
    });

    // Get JSONified info for the given file. Used by angular to fill in the page.
    app.get("/course/:course/assignment/:assignment/student/:student/file/:file/grade/info/", isLoggedIn, function(req, res) {
        var graderUser     = req.session.passport.user;
        var courseName     = req.params.course;
        var assignmentName = req.params.assignment;
        var studentName    = req.params.student;
        var fileName       = req.params.file;


        Course.findOne({"name": courseName}, function(err, course) {
            if (err) {
                res.send("error getting course");
                return;
            }

            var assignments = course.assignments;
            var assignment = Helpers.assignmentWithName(assignmentName, assignments);

            if(!assignment) {
                console.log("Failed to find assignemnt " + assignmentName + " by name");
                return;
            }

            Grader.find({"course_id": course._id, "name": graderUser.name},
                   function(err, grader) {
                       Student.findOne({"course_id": course.id, "name": studentName},
                               function(err, student) {
                                  var templateIndex =
                                  Helpers.fileInAssignmentWithName(
                                                      assignment,
                                                      fileName
                                  );

                                  var fileIndex = Helpers.fileInStudentWithNumber(
                                                    student.files,
                                                    course.assignments,
                                                    assignment,
                                                    templateIndex
                                                   );

                                  var templateFile = assignment.files[templateIndex];
                                  var studentFile  = student.files[fileIndex];

                                  var file = Helpers.mergeFiles(
                                                  [studentFile],
                                                  [templateFile]
                                             )[0];

                                  data = {
                                      "template": templateFile,
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


    /* TODO: if might be possible to pass the URL params from here to angular.
     *       If so, we should do it that way rather than ugly hard-coded parsing
     *       in grader_controller.
     */
    app.get("/course/:course/assignment/:assignment/student/:student/file/:file/grade", isLoggedIn, function(req, res) {
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
    app.get("/course/:course/assignment/:assignment/file/:file/submit/",
      isLoggedIn, function(req, res) {
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

                var file = retrievedFile;

                // Get the relevant submission (the last added, i.e. most recently submitted)
                var submission = file.submissions[file.submissions.length - 1];

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
}
