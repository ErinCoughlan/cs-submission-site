// app/models/user.js
// load the things we need
var mongoose = require('mongoose');
var bcrypt   = require('bcrypt-nodejs');

// define the schema for our user model
//var ObjectId = mongoose.Schema.ObjetId;
//var ObjectId = mongoose.Types.ObjectId;
var ObjectId = mongoose.Schema.Types.ObjectId;

var userSchema = mongoose.Schema({
    local            : {
        username     : String,
        email        : String,
        password     : String,
    },
    // Keep refs to this user's instances as a student and a grader
    students: [{
        course_id: ObjectId, 
        files: [{
            grade: Number,
            gradedBy: ObjectId,
            partner: ObjectId,
            name: String,
            studentComments: String,
            graderComments: String,
            assignment: ObjectId,
            template: ObjectId,
            submissions: [{
                document: String, // TODO file
                date: Date,
            }],
        }],
    }],
    
    graders: [{
        course_id: ObjectId,
        gradedFiles: [ ObjectId ],
    }] 
});

// methods ======================
// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('User', userSchema);
