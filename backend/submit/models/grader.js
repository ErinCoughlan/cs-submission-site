var mongoose = require('mongoose');

// the model for a grader in a specific course
var ObjectId = mongoose.Schema.Types.ObjectId;

var graderSchema = mongoose.Schema({
    name: String,
    user_id: ,
    course_id: ObjectId,
    gradedFiles: [ ObjectId ]
});


// create the model expose it to our app
module.exports = mongoose.model('Grader', graderSchema);
