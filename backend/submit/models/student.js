var mongoose = require('mongoose');
var File = require('./file.js');

// the model for a student in a specific course
var ObjectId = mongoose.Schema.ObjectId;
var ObjIdTy = mongoose.Types.ObjectId;
var studentSchema = mongoose.Schema({
    user_id: ObjectId,
    course_id: ObjectId,
    files: [{
        type: Number, ref: 'File'
    }],
    name: String
});


// create the model expose it to our app
module.exports = mongoose.model('Student', studentSchema);
