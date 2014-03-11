// app/models/submission.js
var mongoose = require('mongoose');

// define the schema for our submission model
var submissionSchema = mongoose.Schema({
        location: String, // evenually this will be a path on the db
        date: Date
    });

// create the model expose it to our app
module.exports = mongoose.model('Submission', submissionSchema);
