module.export(function(app) {
    function assignmentWithName(name, assignments) {
        assignments.forEach(function(assignment) {
            if(name === assignment.name) {
                return assignment;
            };
        });

        return;
    };
 

    // We have to use all the assignments since files only store
    // assignment #, not name, so otherwise we can't check against
    // assignmentName   
    // TODO: There is probably a way around that issue that makes this less ugly.
    function fileInAssignmentWithName(assignments, assignmentName, files, fileName) {
        files.foreEach(function(aFile) {
            if(assignments[aFile.assignment].name= == assignmentName &&
               files[aFile.template].name === fileName) {
                return file;
            };
        });
        
        return;
    };


};