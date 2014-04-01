var mongoose = require('mongoose'); 

// the model for a student in a specific course
var objectId = mongoose.Schema.ObjectId;
var ObjIdTy = mongoose.Types.ObjectId;
var studentSchema = mongoose.Schema({
    user_id: ObjectId,
    course_id: ObjectId,
    files: [ObjectId]
});


// create the model expose it to our app
module.exports = mongoose.model('StudentSchema', studentSchema);

