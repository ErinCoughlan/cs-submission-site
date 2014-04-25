var assignWName =  function assignmentWithName(name, assignments) {
    var assignment
    assignments.forEach(function(anAssignment) {
        if(name === anAssignment.name) {
            assignment = anAssignment;
        }
    });

    return assignment;
};


// We have to use all the assignments since files only store
// assignment #, not name, so otherwise we can't check against
// assignmentName
// TODO: There is probably a way around that issue that makes this less ugly.
var fileInAssignWName = function fileInAssignmentWithName(assignments, assignmentName, files, fileName) {
    var file;
    files.forEach(function(aFile) {
        // If we're somehow past the end of the assignments array, bail before
        // we crash.
        if(assignments.length <= aFile.assignment) {
          console.log("File assignment number " + aFile.assignment + " exceeds length of assignment array");
          return;
        }
        assignment = assignments[aFile.assignment];
        if(assignment.name === assignmentName &&
          assignment.files[aFile.template].name === fileName) {
              file = aFile;
        }
    });

    return file;
};

exports.assignmentWithName = assignWName;
exports.fileInAssignmentWithName = fileInAssignWName;
