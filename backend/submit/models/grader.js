var mongoose = require('mongoose'); 

// the model for a student in a specific course
var objectId = mongoose.Schema.ObjectId;
var ObjIdTy = mongoose.Types.ObjectId;
var graderSchema = mongoose.Schema({
    user_id: {type: ObjIdTy, ref: "UserSchema"},
    course_id: {type: ObjIdTy, ref: "CourseSchema"},
    gradedFiles: [{type: ObjIdTy, ref: "FileSchema"}]
});


// create the model expose it to our app
module.exports = mongoose.model('GraderSchema', graderSchema);
