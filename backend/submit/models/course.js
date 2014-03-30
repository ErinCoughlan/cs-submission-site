// app/models/course.js
var mongoose = require('mongoose');

// define the schema for our course model
// ObjectId allows us to reference other objects
var ObjectId = mongoose.Schema.ObjectId;
var courseSchema = mongoose.Schema({
        name: String,
        current_assignment: ObjectId,
        // TODO: add these types
        students: [ObjectId],
        numStudents: Number,
        // graders: [ObjectId],
        // professors: [ObjectId],
        assignments: {
            id: ObjectId,
            name: String,
            point: Number,
            // there really needs to be a list of grades,
            // where we give the right one to each student
            grade: Number
        }
    });

// create the model expose it to our app
module.exports = mongoose.model('Course', courseSchema);
