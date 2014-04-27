var Course     = require('../models/course');
var Assignment = require('../models/assignment');
var Student    = require('../models/student');

module.exports = function(app, passport){

    // json route for assignment info
    app.get("/course/:course/assignment/:assignment", isLoggedIn, function(req, res) {
        var userid = req.session.passport.user;
        var coursename = req.params.course;
        var assignmentname = req.params.assignment;

        Course.findOne({
            "name": coursename
        }, function(err, course) {
            if (err) {
                res.send("Error getting course");
                return;
            }

            var assignment;

            course.assignments.forEach(function(anAssignment) {
                if (anAssignment.name === assignmentname) {
                    assignment = anAssignment;
                }
            });

            if (!assignment) {
                console.log("No matching assignment found");
                return;
            }



            Student.findOne({
                "course_id": course._id
            }, function(err, student) {
                var combined_files = [];
                var index = 0;
                assignment.files.forEach(function(template) {
                    var file = student.files[index];
                    if (file) {
                        combined_files.push({
                            "name": template.name,
                            "maxScore": template.maxScore,
                            "grade": file.grade,
                            "submissions": file.submissions,
                            "studentComments": file.studentComments,
                            "graderComments": file.graderComments
                        });
                    } else {
                        combined_files.push({
                            "name": template.name,
                            "maxScore": template.maxScore
                        });
                    }

                    index += 1;
                });

                console.log(combined_files);

                var data = {
                    "students": student,
                    "course": course,
                    "assignment": assignment,
                    "files": combined_files
                };


                res.json(data);
            });
        });
    });

    // json route for assignment info for graders
    app.get("/grader/course/:course/assignment/:assignment", isLoggedIn, function(req, res) {
        var userid = req.session.passport.user;
        var coursename = req.params.course;
        var assignmentname = req.params.assignment;

        Course.findOne({
            "name": coursename
        }, function(err, course) {
            if (err) {
                res.send("Error getting course");
                return;
            }

            var assignment;

            course.assignments.forEach(function(anAssignment) {
                if (anAssignment.name === assignmentname) {
                    assignment = anAssignment;
                }
            });

            if (!assignment) {
                console.log("No matching assignment found");
                return;
            }



            Student.find({ "course_id": course._id}, function(err, students) {
                var combined_files = [];
                assignment.files.forEach(function(foo) {
                    combined_files.push({
                        "name": foo.name,
                        "studentSubmissions": []
                    });
                });
                console.log(students);

                students.forEach(function(student) {
                    if (student.gradedFiles) {
                        return;
                    }
                    console.log("student:", student);

                    var index = 0;
                    assignment.files.forEach(function(template) {
                        var file = student.files[index];
                        if (file) {
                            combined_files[index].studentSubmissions.push({
                                "student": student.name,
                                "name": template.name,
                                "maxScore": template.maxScore,
                                "grade": file.grade,
                                "gradedBy": file.gradedByName,
                                "submissions": file.submissions,
                                "studentComments": file.studentComments,
                                "graderComments": file.graderComments
                            });
                        } else {
                            combined_files[index].studentSubmissions.push({
                                "student": student.name,
                                "name": template.name,
                                "maxScore": template.maxScore
                            });
                        }

                        index += 1;
                    });


                });

                console.log("Students: " + students);

                var data = {
                    "students": students,
                    "course": course,
                    "assignment": assignment,
                    "files": combined_files
                };


                res.json(data);
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
