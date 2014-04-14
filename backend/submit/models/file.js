var mongoose = require('mongoose');
var Submission = require('./submission.js');
// the model for a student's submtted file
var ObjectId = mongoose.Schema.ObjectId;
var ObjIdTy = mongoose.Types.ObjectId;
var fileSchema = mongoose.Schema({
    grade: Number,
    gradedBy: ObjectId,
    gradedByName: String,
    partner: ObjectId,
    studentComments: String,
    graderComments: String,
    course: ObjectId,
    assignment: Number, // Which element of course.assignments to look at
    template: Number, // Which element of course.assignments.files to look at.
    submissions: [ Submission.submissionSchema ]
}, {collection: 'submit'});


// create the model expose it to our app
module.exports = mongoose.model('File', fileSchema);

