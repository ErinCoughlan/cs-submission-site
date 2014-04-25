// app/models/submission.js
var mongoose = require('mongoose');

// define the schema for our submission model
var submissionSchema = mongoose.Schema({
        document: String, // evenually this will be a path on the db
        date: Date
}, {collection: 'submissions'});

// create the model expose it to our app
module.exports = mongoose.model('Submission', submissionSchema);
