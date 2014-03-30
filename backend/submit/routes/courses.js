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
    
    
    // TODO validate that it's a grutor for the class    
    app.post("/:course/:assignment/:user/:file/grade", isLoggedIn, function(req, res) {
        var userid = req.session.passport.user;
        var courseid = req.params.course;
        var assignmentid = req.params.assignment;
        var user = req.params.user;
        var filenumber = req.params.file;
        
        var grade = req.body.grade;
        console.log("Grade for " + userid + " on " + fileid + " for assignment " + assignmentid + " in class " + course + " " + grade);
        
        var assignment = Assignment.findById(assignmentid, function(err, assignment) {
            console.log("Getting " + assignment);
        if(err) { 
            res.send("Error getting assignment");
            return;
        }
            
            res.send(assignment);
        });
        
        
        var file = assignment.files.filter(function(f) {
            return f.id == filenumber; 
        });
        
        file.grade = grade;
        assignment.save;
        
    });
};

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't, redirect them to the home page
    res.redirect('/');
};
