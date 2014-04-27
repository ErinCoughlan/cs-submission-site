/*global require, __dirname, console, process, module */

var Course     = require('../models/course');
var Assignment = require('../models/assignment');
var Student    = require('../models/student');
var Submission = require("../models/submission.js");
var Helpers = require('../helpers');
var File = require("../models/file.js");
var _ = require("underscore");
var multiparty = require("multiparty");
var util = require("util");
var path = require("path");
var fs = require("fs");

module.exports = function(app, passport){
    // get a student's files, if possible, for a given assignment.

    app.get("/course/:course/assignment/:assignment/student", isLoggedIn, function(req, res) {
        var courseName     = req.params.course;
        var assignmentName = req.params.assignment;
        var studentUserId  = req.session.passport.user;

        Course.findOne({'name': courseName}, function(err, course) {
          if(err) {
            console.log(err);
            return;
          }

          if(!course) {
            console.log("Failed to find course " + courseName + "by name");
          }

          var assignmentIndex = Helpers.getAssignmentIndex(assignmentName, course.assignments);
          Student.findOne({'course_id': course._id, 'user_id': studentUserId},
            function(err, student) {
              if(err) {
                console.log(err);
                return;
              }

              if(!student) {
                console.log("Failed to find student");
                return;
              }

              // TODO: This should be gathered into a helper.
              var studentFiles = [];
              student.files.forEach(function(file) {
                if(file.assignment === assignmentIndex) {
                  studentFiles.push(file);
                }
              });

              if(studentFiles === []) {
                console.log("Failed to find student files for assignment " +
                  assignmentName + ". Was the assignment unsubmitted?");
              }

              assignment = course.assignments[assignmentIndex];

              combinedFiles = Helpers.mergeFiles(studentFiles, assignment.files);

              res.json({"combinedFiles": combinedFiles});
            });
        });
    });
    // recieve file uploads
    app.post("/course/:course/assignment/:assignment/", isLoggedIn, function(req, res) {
        console.log(req.files);
        console.log(req.body);
        var coursename = req.params.course;
        var assignmentname = req.params.assignment;
        var userid = req.session.passport.user;
        var submission = new Submission();

        var form = new multiparty.Form();
        form.parse(req, function(err, fields, files) {
            console.log("fields", fields);
            console.log("files", files);
            Object.keys(files).forEach(function(key, i) {
                var file = files[key][0];
                var filename = file.fieldName;
                console.log("filename", filename);
                // TODO: copy the file to a better location
                var new_file = path.join(__dirname, "/../files", (new Date()).getTime().toString());
                console.log("new path:", new_file);
                copyFile(file.path, new_file, function(err) {
                    if (err){
                        console.log("file copy error", err, "from", file.path);
                    }
                    // make a submission schema
                    var submission = new Submission({
                        "document": new_file,
                        "date": new Date().toJSON()
                    });
                    console.log("submission", submission);
                    // save to mongo
                    submission.save(function(err) {
                        if (err) {
                            console.log("err:", err);
                            res.send("Error saving submission");
                            return;
                        }

                        // Get the current course
                        Course.findOne({
                            "name": coursename
                        }, function(err, retrievedCourse) {
                            if (err) {
                                res.send("Error getting course");
                                return;
                            }

                            console.log("course:", retrievedCourse._id);


                            // Get the current user"s student object for this course
                            Student.findOne({
                                "user_id": userid,
                                "course_id": retrievedCourse._id
                            }, function(err, retrievedStudent) {
                                if (err) {
                                    console.log("error finding student with userid", userid,
                                                "courseid", retrievedCourse._id);
                                    res.send("Error getting student");
                                    return;
                                }
                                console.log("student:", retrievedStudent);

                                // get the correct assignment
                                var assignment = _.findWhere(
                                    retrievedCourse.assignments,
                                    {"name": assignmentname});
                                var assignment_index = _.indexOf(
                                    retrievedCourse.assignments,
                                    assignment);

                                console.log("assignment:", assignment);
                                //res.send(retrievedAssignment);

                                var template = _.findWhere(assignment.files,
                                                       {name: filename});
                                var template_index = _.indexOf(assignment.files,
                                                               template);
                                console.log("templates", assignment.files);
                                console.log("template", template);

                                // TODO catch edge case if assignment changes while this might be being used.
                                // Generally, assignments won"t be being modified when we try to grab files,
                                // so the new-file-creation for all students should be safe usually.

                                // retrievedStudent.files = []
                                var file = _.findWhere(retrievedStudent.files, {
                                            assignment: assignment_index+1,
                                            template: template_index+1});
                                console.log("files:", retrievedStudent.files,
                                            "assignment", assignment_index+1,
                                            "template", template_index+1);
                                if (!file){
                                    console.log("file not found, creating. this should only occur the first time this user submits this file");
                                    file = new File({
                                        assignment: assignment_index+1,
                                        template: template_index+1
                                    });
                                    retrievedStudent.files.push(file);
                                }
                                console.log("file before pushing submission", file);
                                file.submissions.push(submission._id);
                                console.log("after", file);
                                var comment = JSON.parse(fields.comments[0])[key];
                                console.log("comment", comment);
                                file.studentComments = comment;
                                Helpers.updateStudentFiles(retrievedStudent);
                            });
                        });
                    });
                });
            });
        });

        res.send("good");
    });

};


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
            if (cb) {
                cb(err);
            }
            cbCalled = true;
        }
    }
}


function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't, redirect them to the home page
    res.redirect('/');
}
