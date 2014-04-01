var mongoose = require('mongoose');

// the model an assignment uses as a template for file submissions.
var objectId = mongoose.Schema.ObjectId;
var ObjIdTy = mongoose.Types.ObjectId;
var fileTemplateSchema = mongoose.Schema({
    assignment: ObjectId,
    name: String,
    maxScore: Number,
    partnerable: Boolean,
    numGraded: Number
});


// create the model expose it to our app
module.exports = mongoose.model('FileTemplateSchema', fileTemplateSchema);

