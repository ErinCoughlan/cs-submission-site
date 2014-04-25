var Course     = require('../models/course');
var Assignment = require('../models/assignment');
var Student    = require('../models/student');

module.exports = function(app, passport){
    // recieve file uploads
    app.post("/course/:course/assignment/:assignment/", isLoggedIn, function(req, res) {
        console.log(req.files);
        console.log(req.body);
        var coursename = req.params.course;
        var assignmentid = req.params.assignment;
        var userid = req.session.passport.user;
        var submission = new Submission();

        var form = new multiparty.Form();
        form.parse(req, function(err, fields, files) {
            console.log("fields", fields);
            console.log("files", files);
            Object.keys(files).forEach(function(key, i) {
                var file = files[key][0];
                var filename = file.fieldName;
                console.log("fileid", filename);
                // TODO: copy the file to a better location
                var new_file = path.join(__dirname, "files", (new Date()).getTime().toString());
                copyFile(file.path, new_file, function(err) {
                    // make a submission schema
                    var submission = new Submission({
                        "document": new_file,
                        "date": new Date().toJSON()
                    });
                    console.log(submission);
                    // save to mongo
                    submission.save(function(err) {
                        console.log(err);
                        console.log(new_file, submission);

                        // Get the current course
                        Course.findOne({
                            "name": coursename
                        }, function(err, retrievedCourse) {
                            if (err) {
                                res.send("Error getting course");
                                return;
                            }

                            var course = retrievedCourse;
                            console.log(course._id);


                            // Get the current user"s student object for this course
                            Student.findOne({
                                "user_id": userid,
                                "course_id": course._id
                            }, function(err, retrievedStudent) {
                                if (err) {
                                    res.send("Error getting student");
                                    return;
                                }

                                var student = retrievedStudent;
                                console.log(student._id);

                                // get the correct assignment
                                Assignment.findOne({
                                    "_id": assignmentid},
                                    function(err, retrievedAssignment) {
                                        if (err) {
                                            res.send("Error getting assignment");
                                            return;
                                        }

                                        var assignment = retrievedAssignment;
                                        res.send(assignment);

                                        // Get the correct file for this assignment
                                        // TODO catch edge case if assignment changes while this might be being used.
                                        // Generally, assignments won"t be being modified when we try to grab files,
                                        // so the new-file-creation for all students should be safe usually.
                                        File.findOne({
                                            "assignment": assignment._id,
                                            "name": filename,
                                            "owner": student._id
                                        }, function(err, retrievedFile) {
                                            if (err) {
                                                res.send("Error getting file");
                                                return;
                                            }

                                            retrievedFile.submissions.push(submission._id);
                                            var comment = JSON.parse(fields.comments[0])[key];
                                            console.log("comment", comment);
                                            retrievedFile.studentComments = comment;
                                            console.log("about to save file");
                                            retrievedFile.save();

                                        });
                                });
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
