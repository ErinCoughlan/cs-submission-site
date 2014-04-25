/*global require, __dirname, console, process */

/**
 * Module dependencies.
 */

// Must come before requiring express
var flash = require("connect-flash");

var express = require("express");
var http = require("http");
var path = require("path");
var _ = require("underscore");

// file uploading
var multiparty = require("multiparty");
var util = require("util");
var path = require("path");
var fs = require("fs");

var csv = require("csv");

var frontBase = __dirname + "/../../frontend/";

// Config mongoose
var mongoose = require("mongoose");
var configDB = require("./config/database.js");
mongoose.connect(configDB.url);

// Login configuration
var passport = require("passport");

var User = require("./models/user.js");
var Grader = require("./models/grader.js");
var Student = require("./models/student.js");
var Professor = require("./models/professor.js");
var Course = require("./models/course.js");
var Assignment = require("./models/assignment.js");
var Submission = require("./models/submission.js");
var File = require("./models/file.js");
var FileTemplate = require("./models/fileTemplate.js");

// Configuration to handle the removal of req.flash
var app = express();
app.use(flash()); // use connect-flash for flash messages stored in session


// configure passport stuff
require("./config/passport")(passport);

// all environments
app.set("port", process.env.PORT || 3000);
app.set("views", path.join(frontBase, "html"));
app.set("view engine", "jade");
app.use(express.static(frontBase));
app.use(express.favicon());
app.use(express.logger("dev"));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser("your secret here"));
app.use(express.session({
    secret: "more secrets"
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.json()); // to support JSON-encoded bodies
app.use(express.urlencoded()); // to support URL-encoded bodies

//routes
var routes = require("./routes/routes")(app, passport);

app.get("/", function(req, res) {
    res.render("index");
});

// create file documents from fileTemplates. hardcoded to testuser.
// running this will create duplicates.
app.get("/filesfromtemplates", function(req, res) {
    FileTemplate.find({}, function(err, templates) {
        templates.forEach(function(template) {
            var file = {
                "assignment": template.assignment,
                "template": template._id,
                "owner": "533abdaee4b09d8a1148b087",
                "course": "531ea533e4b0ea5911efe9f6",
                "grade": null,
                "name": template.name,
                "gradedBy": null,
                "partner": null,
                "studentComments": null,
                "graderComments": null,
                "submissions": []
            };
            console.log(file);
            new File(file).save(file);
        });
    });
    res.send("ok");
});

app.post("/login",
    passport.authenticate("local-login", {
        successRedirect: "/home",
        failureRedirect: "/",
        failureFlash: true
    })
);

app.get("/logout", function(req, res) {
    req.logout();
    res.redirect("/");
});

app.post("/signup", passport.authenticate("local-signup", {
    successRedirect: "/", // redirect to the secure profile section
    failureRedirect: "/signup", // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
}));

app.get("/signup", function(req, res) {
    // render the page and pass in any flash data if it exists
    res.render("signup", {
        message: req.flash("Message")
    });
});

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

// development only
if ("development" == app.get("env")) {
    app.use(express.errorHandler());
}

http.createServer(app).listen(app.get("port"), function() {
    console.log("Express server listening on port " + app.get("port"));
});
