// app/models/assignment.js
var mongoose = require('mongoose');

// define the schema for our assignment model
// ObjectId allows us to reference other objects
var ObjectId = mongoose.Schema.ObjectId;
var assignmentSchema = mongoose.Schema({
        name: String,
        due: Date,
        // TODO: add these types
        // type: ObjectId,
        // euros: Number,
        files: [{
            // TODO: make into a real type if it seems neccessary
            id: String,
            name: String,
            point: Number,
            grade: Number,
            gradedBy: ObjectId,
            comment: String,
            // TODO
            // partners: [ObjectId],
            submissions: [{
                id: ObjectId,
                date: Date
            }]
        }]
    });

// create the model expose it to our app
module.exports = mongoose.model('Assignment', assignmentSchema);
