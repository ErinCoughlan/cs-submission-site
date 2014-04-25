var Course     = require('../models/course');
var Assignment = require('../models/assignment');
var Student    = require('../models/student');
var User       = require('../models/user');
var Professor  = require('../models/professor');

module.exports = function(app, passport){
    app.get("/admin/newCourse", function(req, res) {
        res.render("add_course");
    });

    // Add a new course
    app.post("/addCourse", function(req, res) {
        coursename = req.body.course;
        username = req.body.professor;
        console.log("course name: " + coursename);
        console.log("professor name: " + username);

        // Create the course
        Course.findOne({
            "name": coursename
        }, function(err, course) {
            if (course) {
                console.log("course already created");
                return;
            }

            course = new Course();
            course.name = courseName;
            course.save();

            // Add the professor
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

                // Make the user a professor for the course
                Professor.findOne({
                    "user_id": user._id,
                    "course_id": course._id
                }, function(err, professor) {
                    if (professor) {
                        console.log("professor already added");
                        return;
                    }

                    professor = new Professor();
                    professor.course_id = course._id;
                    professor.user_id = user._id;
                    professor.name = username;
                    professor.save();
                    user.professors.push(professor._id);
                        user.save();
                });
            });
        });

        res.redirect("/home");
    });




};


function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't, redirect them to the home page
    res.redirect('/');
}
