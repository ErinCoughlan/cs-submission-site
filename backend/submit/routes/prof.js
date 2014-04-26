var Course     = require('../models/course');
var Assignment = require('../models/assignment');
var FileTemplate = require('../models/fileTemplate');
var Student    = require('../models/student');
var Grader     = require('../models/grader');
var User       = require('../models/user');
var Professor  = require('../models/professor');

module.exports = function(app, passport){
    app.get("/prof", isLoggedIn, function(req, res) {
        res.render("prof");
    });

    app.get("/prof/course/:course", isLoggedIn, function(req, res) {
        res.render("prof");
    });
    
    app.get("/prof/course/:course/addStudent", isLoggedIn, function(req, res) {
        res.render("add_student");
    });


    app.post("/addstudents/course/:course", function(req, res) {
        var coursename = req.params.course;

        Course.findOne({
            "name": coursename
        }, function(err, course) {
            var studentsText = req.body.students;
            var shouldBeGrader = req.body.grader;

            var noSpaces = studentsText.replace(/\s/g, "");
            var separatedOnCommas = noSpaces.split(",");

            separatedOnCommas.forEach(function(username) {
                User.findOne({
                    "local.username": username
                }, function(err, user) {
                    if (!user) {
                        user = new User();
                        user.local.username = username;
                        user.local.password = user.generateHash("asdf");
                        user.local.email = "placeholder@cs.hmc.edu";
                        user.save();
                    }

                    if (shouldBeGrader) {
                        Grader.findOne({
                            "user_id": user._id,
                            "course_id": course._id
                        }, function(err, grader) {
                            if (grader) {
                                return;
                            }

                            grader = new Grader();
                            grader.course_id = course._id;
                            grader.user_id = user._id;
                            grader.name = username;
                            grader.save();
                            user.graders.push(grader._id);
                            user.save();
                        });
                    } else {
                        Student.findOne({
                            "user_id": user._id,
                            "course_id": course._id
                        }, function(err, student) {
                            if (student) {
                                return;
                            }

                            student = new Student();
                            student.course_id = course._id;
                            student.user_id = user._id;
                            student.name = username;
                            student.save();
                            user.students.push(student._id);
                            user.save();
                        });
                    }
                });
            });
        });
        res.redirect("/prof/course/"+coursename+"/addStudent");
    });


    app.post("/removestudents/course/:course", function(req, res) {
        var coursename = req.params.course;

        Course.findOne({
            "name": coursename
        }, function(err, course) {
            var students = req.body.students;
            var graders = req.body.grader;

            students.forEach(function(student) {
                if (student.toRemove) {
                    User.findOne({
                        "local.username": student.name
                    }, function(err, user) {
                        var index = 0;
                        user.students.forEach(function(aStudent) {
                            if (student._id === aStudent) {
                                user.students.splice(index, 1);
                            }

                            index += 1;
                        });

                        Student.findOne({
                            "course_id": course._id,
                            "name": student.name
                        }, function(err, aStudent) {
                            aStudent.remove();
                        });
                    });
                }
            });

            graders.forEach(function(grader) {
                if (grader.toRemove) {
                    User.findOne({
                        "local.username": grader.name
                    }, function(err, user) {
                        var index = 0;
                        user.students.forEach(function(aGrader) {
                            if (grader._id === aGrader) {
                                user.graders.splice(index, 1);
                            }

                            index += 1;
                        });

                        Grader.findOne({
                            "course_id": course._id,
                            "name": grader.name
                        }, function(err, aGrader) {
                            aGrader.remove();
                        });
                    });
                }
            });

        });
        res.redirect("/prof/course/"+coursename+"/addStudent");
    });

    app.post("/course/:course/addAssignment", function(req, res) {
        var coursename = req.params.course;
        var name = req.body.name;
        var due = req.body.due;
        var files = req.body.files;

        var totalPoints = 0;

        Course.findOne({
            "name": coursename
        }, function(err, course) {
            var templates = [];
            for (var i = 0; i < files.length; i++) {
                var f = files[i];
                fileTemplate = new FileTemplate();
                fileTemplate.name = f.name;
                fileTemplate.maxScore = Number(f.maxPoints);
                fileTemplate.partnerable = f.partnerable;
                fileTemplate.save();

                totalPoints += Number(f.maxPoints);
                templates.push(fileTemplate);
            }

            assignment = new Assignment();
            assignment.name = name;
            assignment.due = new Date(due);
            assignment.point = Number(totalPoints);
            assignment.files = templates;

            course.assignments.push(assignment);
            course.save();
        });
        res.redirect("/prof/course/"+coursename);
    });

    app.post("/course/:course/deleteAssignment", function(req, res) {
        var coursename = req.params.course;
        var aName = req.body.name;

        Course.findOne({
            "name": coursename
        }, function(err, course) {
            // Remove the assignment from the course
            var index = 0;
            course.assignments.forEach(function(assignment) {
                if (assignment.name === aName) {
                    course.assignments.splice(index, 1);
                    course.save();
                }

                index += 1;
            });
        });
        res.redirect("/prof/course/"+coursename);
    });

    app.post("/course/:course/saveAssignment", function(req, res) {
        var coursename = req.params.course;
        var aName = req.body.name;

        Course.findOne({
            "name": coursename
        }, function(err, course) {
            // Find the correct assignment so we can modify it
            var index = 0;
            course.assignments.forEach(function(assignment) {
                if (assignment.name === aName) {
                    // Any changes go here
                    course.save();
                }

                index += 1;
            });
        });
        res.redirect("/prof/course/"+coursename);
    })

};


function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't, redirect them to the home page
    res.redirect('/');
}
