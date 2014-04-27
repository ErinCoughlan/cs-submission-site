var assignWName =  function assignmentWithName(name, assignments) {
    var assignment;
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
    var fileIndex;
    var found = false;
    files.forEach(function(aFile, index) {
        // If we're somehow past the end of the assignments array, bail before
        // we crash.
        if(assignments.length <= aFile.assignment) {
          console.log("File assignment number " + aFile.assignment + " exceeds length of assignment array");
          return;
        }
        assignment = assignments[aFile.assignment];

        if(assignment.name === assignmentName &&
          assignment.files[aFile.template].name === fileName) {
              fileIndex = index;
              found = true;
        }
    });
    if(found === false) {
      return -1;
    }

    return fileIndex;
};

var updateStudentFiles = function updateStudentFiles(student) {
  var newFiles = [];
  student.files.forEach(function(file) {
    newFiles.push(file);
  });

  student.update({$set: {"files": newFiles}}, function(err, numAffected) {
    if(err)
      console.log(err);
  });

  return student;
};

var getAssignmentIndex = function getAssignmentIndex(assignmentName, assignments) {
  var assignIndex;
  assignments.forEach(function(assignment, index) {
    if(assignment.name === assignmentName) {
      assignIndex = index;
    }
  });

  return assignIndex;
};

// Returns an array of files, each of which has both the template file's info
// and the corresponding student file's info (e.g. grade)
var mergeFiles = function mergeFiles(studentFiles, templateFiles) {
  var files = [];

  // We always have all the template files, so we start with those
  templateFiles.forEach(function(template, index) {
    var file = template;

    // Since hopefully the number of files and templates is relatively low,
    // for now we'll eat mn runtime. But really, there has to be a better way
    // to do this. So,
    // TODO: more efficient algorithm

    studentFiles.forEach(function(studentFile) {
      if(studentFile.template === index) {
        //TODO: Partner's name
        file.grade           = studentFile.grade;
        file.gradedBy        = studentFile.gradedBy;
        file.gradedByName    = studentFile.gradedByName;
        file.studentComments = studentFile.studentComments;
        file.graderComments  = studentFile.graderComments;
      }
    });

    files.push(file);
  });

  return files;
};

exports.assignmentWithName       = assignWName;
exports.fileInAssignmentWithName = fileInAssignWName;
exports.updateStudentFiles       = updateStudentFiles;
exports.getAssignmentIndex       = getAssignmentIndex;
exports.mergeFiles               = mergeFiles;
