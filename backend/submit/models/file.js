var mongoose = require('mongoose');

// the model for a student's submtted file
var ObjectId = mongoose.Schema.ObjectId;
var ObjIdTy = mongoose.Types.ObjectId;
var fileSchema = mongoose.Schema({
    grade: Number,
    gradedBy: ObjectId,
    owner: ObjectId,
    partner: ObjectId,
    studentComments: String,
    graderComments: String, 
    course: ObjectId,
    assignment: ObjectId,
    template: ObjectId,
    submissions: [ ObjectId ]
});


// create the model expose it to our app
module.exports = mongoose.model('File', fileSchema);

