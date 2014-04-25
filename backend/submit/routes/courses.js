var Course     = require('../models/course');
var Assignment = require('../models/assignment');
var Student    = require('../models/student');
var Grader     = require('../models/grader');
var Professor  = require('../models/professor');

module.exports = function(app, passport){
    app.get('/cs5', isLoggedIn, function(req, res) {
        res.render('student');
    });

    app.get('/courses', isLoggedIn, function(req, res) {
        Course.find({}, function(err, courses) {
            var data = { "courses": courses};
            res.json(data);
        });
    });
    
    // Get course object
    app.get('/course/:course', isLoggedIn, function(req, res) {
        var userid = req.session.passport.user;
        var courseid = req.params.course;
        var course = Course.findOne({"name":courseid});

        res.render('student');
    });
   

    // get all students in a course
    app.get("/students/:course", isLoggedIn, function(req, res) {
        var courseid = req.params.course;
        Course.findOne({
            "name": courseid
        }, function(err, course) {
            // Find all matching students
            if (err) {
                res.send("error getting course");
                return;
            }
            
            Student.find({
                "course_id": course._id}, function(err, students) {
                    if (err) {
                        res.send("error getting students");
                        return;
                    }

                    var data = {
                        "students": students
                    };
                    res.json(data);
                });
        });
    });

    // get all graders for a course
    app.get("/graders/:course", isLoggedIn, function(req, res) {
        var courseid = req.params.course;
        Course.findOne({
            "name": courseid
        }, function(err, course) {
            // Find all matching students
            if (err) {
                res.send("error getting course");
                return;
            }

            Grader.find({
                "course_id": course._id}, function(err, graders) {
                    if (err) {
                        res.send("error getting students");
                        return;
                    }
                    console.log(graders);
                    
                    var data = {
                        "graders": graders
                    };
                    res.json(data);
                });
        });
    });
    
    // json route for course info
    app.get("/assignments/:course", isLoggedIn, function(req, res) {
        var userid = req.session.passport.user;
        var courseid = req.params.course;
        console.log("got request for course", req.params, "from", req.session);
        
        Course.findOne({
            "name": courseid
        }, function(err, course) {
            console.log("sending", courseid);
            if (err) {
                res.send("Error getting list of assignments.");
                return;
            }
            
            console.log("Course contents: ", course);
            var assignments = course.assignments;
            var data = {
                "course": course,
                "assignments": assignments
            };
            
            res.json(data);
        });
    });


    // export gradebook for a course as csv.
    app.get("/course/:course/export", isLoggedIn, function(req, res) {
        var coursename = req.params.course;
        console.log("coursename", coursename);
        
        // get the course
        Course.findOne({
            "name": coursename
        }, function(err, retrievedCourse) {
            if (err) {
                res.send("Error getting course");
                return;
            }
            // make the top rows of the table
            var time = (new Date()).toUTCString();
            var title_row = [coursename + " Gradebook", time];
            var assignments_row = ["Assignment"];
            var files_row = ["File"];
            var max_row = ["Max Points"];
            retrievedCourse.assignments.forEach(function(assignment) {
                assignments_row.push(assignment.name);
                files_row.push("");
                max_row.push(assignment.point);
                assignment.files.forEach(function(file) {
                    assignments_row.push("");
                    files_row.push(file.name);
                    max_row.push(file.maxScore);
                });
            });
            var data = [title_row, assignments_row, files_row, max_row];
            // now make the body of the table
            Student.find({
                "course_id": retrievedCourse._id
            }, function(err, students) {
                // make a row of grades for each student
                students.forEach(function(student) {
                    var student_row = [student.name];
                    retrievedCourse.assignments.forEach(function(assignment, aix) {
                        // make a sub-row for each assignment
                        var assignment_total = 0;
                        var assignment_row = [];
                        assignment.files.forEach(function(file, fix) {
                            // use the array indices to find the right file.
                            // would be better to use template id for this, but the per-user file info currently gives us that it is the nth assignment and template.
                            var file_info = _.find(student.files, function(student_file) {
                                var right_assignment = (student_file.assignment === aix + 1);
                                var right_template = (student_file.template === fix + 1);
                                return right_assignment && right_template;
                            });
                            if (file_info && _.isNumber(file_info.grade)) {
                                assignment_total += file_info.grade;
                                assignment_row.push(file_info.grade);
                            } else {
                                assignment_row.push("none");
                            }
                        });
                        // add assignment total score to beginning
                        assignment_row.unshift(assignment_total);
                        student_row = student_row.concat(assignment_row);
                    });
                    data.push(student_row);
                });
                console.log(data, "data");
                res.setHeader("Content-disposition", "attachment; filename=gradebook.csv");
                csv().from(data).to(res);
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
