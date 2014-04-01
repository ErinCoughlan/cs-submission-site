var mongoose = require('mongoose');

// the model for a student's submtted file
var objectId = mongoose.Schema.ObjectId;
var ObjIdTy = mongoose.Types.ObjectId;
var fileSchema = mongoose.Schema({
    grade: Number,
    gradedBy: {type: ObjIdTy, ref: 'GraderSchema'},
    owner: {type: ObjIdTy, ref: 'StudentSchema'},
    partner: {type: ObjIdTy, ref: 'StudentSchema'},
    studentComments: String,
    graderComments: String, 
    course: {type: ObjIdTy, ref: 'CourseSchema'},
    assignment: {type: ObjIdTy, ref: 'AssignmentSchema'},
    template: {type: ObjIdTy, ref: 'FileTemplateSchema'},
    submissions: [{
        type: ObjIdTy, ref: 'SubmissionSchema'
    }];
});


// create the model expose it to our app
module.exports = mongoose.model('FileSchema', fileSchema);

