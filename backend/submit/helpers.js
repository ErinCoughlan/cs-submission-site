/* TODO: As noted in many of the TODOs in the routes files, the way we use
 *       forEach loops in, for example, assignmentWithName, is ugly and should
 *       at minimum always be using a helper. We might even want to abstract
 *       further, so that we pass something an array, a property value, and a
 *       property name, and it finds the element of the array that matches on
 *       that property. Or maybe there's already a JS function for that?
 */

// Gets an assignment from a list of assignments by name.
// TODO: Will need to be rewritten when assignments have IDs.
// TODO: Or will just be unneeded then, hopefully.
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
// TODO: This method should be fixed when assignments, templates, etc have IDs.
var fileInAssignWName = function fileInAssignmentWithName(assignment, fileName) {
    var fileIndex = -1;

    assignment.files.forEach(function(aFile, index) {
        if(aFile.name === fileName) {
              fileIndex = index;
        }
    });

    return fileIndex;
};

// Get a student's file corresponding to a given assignment and template.
// TODO: Doesn't actually need to take assignment, just assignmentName
// TODO: This is also just a really hacky function, and the approach should
//       probably be rethought.
var fileInStudentWNum = function fileInStudentWithNumber(files, assignments, assignment, templateNumber) {
  var fileIndex = -1;
  files.forEach(function(aFile, index) {
    if(aFile.template === templateNumber && assignments[aFile.assignment].name == assignment.name) {
      fileIndex = index;
    }
  });

  return fileIndex;
};

// Force an update of a student's files to work around limitations of .save()
var updateStudentFiles = function updateStudentFiles(student) {

  /* Hack to get around .save() problems. We just push all the files in
   * student.files into a new array, then update with a set of the files field
   * to the new array. This causes changes to fields in objects in the array
   * (e.g. grades) to be saved, which does not appear to happen with a simple
   * .save()
   */
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

// Get the index in course.assignments for a given assignment.
// TODO: Assumes unique assignment names. If assignments get IDs, this function
//       need to be changed to use them.
var getAssignmentIndex = function getAssignmentIndex(assignmentName, assignments) {
  var assignIndex;
  assignments.forEach(function(assignment, index) {
    if(assignment.name === assignmentName) {
      assignIndex = index;
    }
  });

  return assignIndex;
};

/* Returns an array of files, each of which has both the template file's info
 * and the corresponding student file's info (e.g. grade). If the student is
 * missing a file, the template file info is used alone, and the student file
 * fields are unset
 */
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
      // Catch the case where there wasn't a studentFile
      if(studentFile && studentFile.template === index) {
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
exports.fileInStudentWithNumber    = fileInStudentWNum;
