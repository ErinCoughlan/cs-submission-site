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
    app.post("/:course/:assignment/:student/:file/grade", isLoggedIn, function(req, res) {
        var grader         = req.session.passport.user;
        var courseName     = req.params.course;
        var assignmentName = req.params.assignments;
        var studentName    = req.params.student;
        var fileName       = req.params.file;

        // Hit the database for all the things we need to save this. Cry inside.
        Course.findOne({"name": courseName}, function(err, course) {
            if (err) {
                res.send("error getting course");
                return;
            }

            Assignment.findOne({"course": course.id_, "name": assignmentName}, function(err, assignment) {
                if (err) {
                    res.send("error getting assignment");
                    return;
                }

                Student.findOne({"name": studentName, "course_id": course.id_}, function(err, student) {
                    if (err) {
                        res.send("error getting student");
                        return;
                    }

                    FileTemplate.findOne({"name": fileName, "assignment": assignment.id_}, function(err, fileTemplate) {
                        if(err) {
                            res.send("error getting filetemplate");
                            return;
                        }

                        File.findOne({"template": fileTemplate.id_, "owner": student.id_}, function(err, file) {
                            if(err) {
                                res.send("error getting file");
                                return;
                            }

                            file.graderCommens = req.body.comments;
                            file.grade         = req.body.grade;

                            Grader.findOne({"user_id": grader, "course_id": course.id_}, function(err, grader) {
                                if(err) {
                                    res.send("error getting grader object from user");
                                    return;
                                }

                                file.grader = grader.id_;
                                file.save();
                            });
                        });
                    });
                });
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

