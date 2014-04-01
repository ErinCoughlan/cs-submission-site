// app/models/course.js
var mongoose = require('mongoose');

// define the schema for our course model
// ObjectId allows us to reference other objects
var ObjectId = mongoose.Schema.ObjectId;
var courseSchema = mongoose.Schema({
    name: String,
    current_assignment: ObjectId,
    // TODO: add these types
    // students: [ObjectId],
    // graders: [ObjectId],
    // professors: [ObjectId],
    assignments: [{
        type: ObjectId, ref: "AssignmentSchema"
    }];
});

// create the model expose it to our app
module.exports = mongoose.model('CourseSchema', courseSchema);
