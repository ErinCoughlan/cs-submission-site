var Course = require('../models/course');
var Assignment = require('../models/assignment');


module.exports = function(app, passport){
    app.get('/cs5', isLoggedIn, function(req, res) {
        res.render('student');
    });
    
    
    app.get('/course/:course', isLoggedIn, function(req, res) {
        var userid = req.session.passport.user;
        var courseid = req.params.course;
        var course = Course.findOne({"name":courseid});

        res.render('student');
    });
    
  };

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't, redirect them to the home page
    res.redirect('/');
};
