// app/models/student.js
var mongoose = require('mongoose');

// define the schema for our assignment model
// ObjectId allows us to reference other objects
var ObjectId = mongoose.Schema.ObjectId;
var studentSchema = mongoose.Schema({
        name: String,
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
module.exports = mongoose.model('Student', studentSchema);