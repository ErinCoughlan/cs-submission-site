var mongoose = require('mongoose');

// the model for a grader in a specific course
var ObjectId = mongoose.Schema.Types.ObjectId;

var professorSchema = mongoose.Schema({
    name: String,
    user_id: ObjectId,
    course_id: ObjectId,
    gradedFiles: [ ObjectId ]
}, {collection: 'profs'});


// create the model expose it to our app
module.exports = mongoose.model('Professor', professorSchema);
