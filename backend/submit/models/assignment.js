// app/models/assignment.js
var mongoose = require('mongoose');
var filetemplate = require('filetemplate');
// define the schema for our assignment model
// ObjectId allows us to reference other objects

var ObjectId = mongoose.Schema.ObjectId;
var ObjIdTy = mongoose.Types.ObjectId;
var assignmentSchema = mongoose.Schema({
    course_id: ObjectId,
    name: String,
    due: Date,
    // TODO: add these types
    // type: ObjectId,
    euros: Number,
    files: [ ObjectId ]
});

// create the model expose it to our app
module.exports = mongoose.model('AssignmentSchema', assignmentSchema);
