var mongoose = require('mongoose');

// the model for a student's submtted file
var objectId = mongoose.Schema.ObjectId;
var fileSchema = mongoose.Schema({
    grade: Number,
    gradedBy: {type: ObjectId, ref: 'GraderSchema'},
    owner: {type: ObjectId, ref: 'StudentSchema'},
    partner: {type: ObjectId, ref: 'StudentSchema'},
    studentComments: String,
    graderComments: String, 
    course: {ObjectId, ref: 'CourseSchema'},
    assignment: {ObjectId, ref: 'AssignmentSchema'},
    template: {ObjectId, ref: 'FileTemplateSchema'},
    submissions: [{
        ObjectId, ref: 'SubmissionSchema'
    }];
});


// create the model expose it to our app
module.exports = mongoose.model('FileSchema', fileSchema);

