var mongoose = require('mongoose'); 

// the model for a student in a specific course
var objectId = mongoose.Schema.ObjectId;
var graderSchema = mongoose.Schema({
    user_id: {type: ObjectId, ref: "UserSchema"},
    course_id: {type: ObjectId, ref: "CourseSchema"},
    gradedFiles: [{type: ObjectId, ref: "FileSchema"}]
});


// create the model expose it to our app
module.exports = mongoose.model('GraderSchema', graderSchema);
