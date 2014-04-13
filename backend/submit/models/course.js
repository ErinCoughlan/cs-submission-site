// app/models/course.js
var mongoose = require('mongoose');
var Assignment = require('./assignment.js');
// define the schema for our course model
// ObjectId allows us to reference other objects
var ObjectId = mongoose.Schema.Types.ObjectId;
//var ObjIdTy = mongoose.Types.ObjectId;
var courseSchema = mongoose.Schema({
    name: String,
    current_assignment: Number, // Index into assignments
    // TODO: add these types
    // students: [ObjectId],
    // graders: [ObjectId],
    // professors: [ObjectId],
    assignments: [ Assignment ],
}, {collection: 'submit'});

// create the model expose it to our app
module.exports = mongoose.model('Course', courseSchema);
