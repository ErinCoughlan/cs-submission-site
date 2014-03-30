app.get('/:course', isLoggedIn, function(req, res) {
    var userid = req.session.passport.user;
    var courseid = req.params.course;
    Course.findById(courseid, function(err, course) { 
        console.log("Loading course home page", course);
        if(err) {
            res.send("Error getting course homepage");
            return;
        }
        res.send(course);
        
    });
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


    var file = assignment.files.filter(funciton(f) {
        return f.id == filenumber; 
    });

    file.grade = grade;
    assignment.save;
    
}

