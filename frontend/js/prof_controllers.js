//
//  Spring 2014 - Erin Coughlan & Philip Davis & Luke Sedney

// for the benefit of JSLint:
/*global submissionApp, angular, document, alert, console, FormData, $, window, location*/


(function() {
    "use strict";
    var courseId;

    submissionApp.controller('ProfCtrl', function($scope, $http, $route, $routeParams, $location) {
        this.$route = $route;
        this.$location = $location;
        this.$routeParams = $routeParams;

        var splitUrl = $location.absUrl().split(/[\/#]+/);
        var indexCourse = splitUrl.indexOf("course");
        if (indexCourse != -1) {
            courseId = splitUrl[indexCourse + 1];
        }

        // get the list of all courses (eventually for the given user)
        $http.get('/courses').success(
            function(data) {
                $scope.courses = data.courses;
                var index;
                if (courseId) {
                    index = $scope.courses.map(function(e) {
                        return e.name;
                    }).indexOf(courseId);
                    $scope.course = $scope.courses[index];
                    $scope.courseid = $scope.courses[index].name;
                } else {
                    $scope.course = $scope.courses[0];
                    $scope.courseid = $scope.courses[0].name;
                }

                // get the list of assignments
                $http.get('/assignments/' + $scope.courseid).success(
                    function(data) {
                        $scope.assignments = data.assignments;
                    }
                );

                // Remove the current course and sort the rest for the dropdown
                var altCourses = $scope.courses;
                index = altCourses.map(function(e) {
                    return e.name;
                }).indexOf($scope.course.name);
                if (index > -1) {
                    altCourses.splice(index, 1);
                }
                altCourses.sort(function(a, b) {
                    if (a.name === b.name) {
                        return 0;
                    } else if (a.name > b.name) {
                        return 1;
                    } else {
                        return -1;
                    }
                });

                $scope.altCourses = altCourses;

                $http.get('/students/' + $scope.courseid).success(
                    function(data) {
                        data.students.sort(function(a, b) {
                            if (a.name === b.name) {
                                return 0;
                            } else if (a.name > b.name) {
                                return 1;
                            } else {
                                return -1;
                            }
                        });
                        $scope.students = data.students;
                    }
                );

                $http.get('/graders/' + $scope.courseid).success(
                    function(data) {
                        data.graders.sort(function(a, b) {
                            if (a.name === b.name) {
                                return 0;
                            } else if (a.name > b.name) {
                                return 1;
                            } else {
                                return -1;
                            }
                        });
                        $scope.graders = data.graders;
                    }
                );
            }
        );

        $scope.addUsers = function addUsers($event) {
            var form = document.getElementById("form-add-student");
            var fd = new FormData(form);

            var studentsText = document.getElementById('student').value;
            var areGraders = document.getElementById('grader').checked;

            var dataStr = JSON.stringify({
                students: studentsText,
                grader: areGraders
            });


            $http({
                url: "/addStudents/course/" + $scope.course.name,
                data: dataStr,
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            }).success(function(m) {
                console.log(m);
                window.location.href = "/prof/course/" + $scope.course.name + "/addStudent";
            }).error(function(m) {
                console.log(m);

            });
        };


        $scope.removeUsers = function addUsers($event) {
            var form = document.getElementById("form-add-student");
            var fd = new FormData(form);

            var studentRemoves = [];

            $scope.students.forEach(function(specificStudent) {
                var foo = specificStudent.name + "Checked";
                var toPush = {
                    name: specificStudent.name,
                    toRemove: document.getElementById(specificStudent.name + "Check").checked
                };

                studentRemoves.push(toPush);
            });

            var graderRemoves = [];

            $scope.graders.forEach(function(specificGrader) {
                var toPush = {
                    name: specificGrader.name,
                    toRemove: document.getElementById(specificGrader.name + "Check").checked
                };
                graderRemoves.push(toPush);
            });


            var dataStr = JSON.stringify({
                students: studentRemoves,
                grader: graderRemoves
            });


            $http({
                url: "/removeStudents/course/" + $scope.course.name,
                data: dataStr,
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            }).success(function(m) {
                console.log(m);
                window.location.href = "/prof/course/" + $scope.course.name + "/addStudent";
            }).error(function(m) {
                console.log(m);
            });
        };

        /**
         * Create a new assignment
         * TODO: The date object does not contain time zone information
         */
        $scope.createAssignment = function createAssignment() {
            var aName = $("input[name='assignmentName'").val();
            var due = $("input[name='dueDate'").val();
            var files = [];

            var dueWithTimezone = new Date(due).toString();
            console.log(dueWithTimezone);
            console.log(new Date(due).toString());
            console.log(new Date(due).toUTCString());
            console.log(new Date(due).toISOString());

            var table = $(".newAssignment");
            var rows = table.find(".newFile");
            for (var i = 0; i < rows.length; i++) {
                var filename = $("input[name='filename-" + i + "']").val();
                var maxPoints = $("input[name='maxPoints-" + i + "']").val();
                var partnerable = $("input[name='partnerable-" + i + "']:checked").val();
                var file = {
                    name: filename,
                    maxPoints: maxPoints,
                    partnerable: partnerable
                };
                files.push(file);
            }

            // Create the assignment object
            var assignment = {
                name: aName,
                due: dueWithTimezone,
                files: files
            };

            $http({
                method: "POST",
                url: "/course/" + courseId + "/addAssignment",
                data: assignment
            }).success(function(data) {
                location.reload();
            });
        };

        /**
         * Delete an assignment
         */
        $scope.deleteAssignment = function deleteAssignment(aName) {
            // Create the assignment object
            var assignment = {
                name: aName
            };

            $http({
                method: "POST",
                url: "/course/" + courseId + "/deleteAssignment",
                data: assignment
            }).success(function(data) {
                location.reload();
            });
        };

        /**
         * Save the assignment and make it appear solid.
         * Saving should occur in the background because we don't actually want
         * to refresh the page.
         */
        $scope.saveAssignment = function saveAssignment(e, id) {
            // Make all the elements permanent
            $('.edit :submit').click();

            // Get all the assignment params ready for saving
            var aName = $('.editable .assignmentName').text();
            var due = $('.editable .assignmentDue').text();
            var files = [];

            // Get the edited row data
            var rows = $(".editable .file");
            console.log(rows);
            var length = rows.length;
            for (var i = 0; i < length; i++) {
                var filename = $(".editable .filename-" + i).text();
                var maxPoints = $(".editable .maxPoints-" + i).text();
                var partnerable = $(".editable .partnerable-" + i).text();
                // Change partnerable to a boolean
                partnerable = (["yes", "Yes", "true"].indexOf(partnerable) != -1);
                var file = {
                    name: filename,
                    maxPoints: maxPoints,
                    partnerable: partnerable
                };
                files.push(file);
            }

            // Get any new row data
            rows = $(".editable .newFile");
            console.log(rows);
            for (var i = length; i < length + rows.length; i++) {
                var filename = $("input[name='filename-" + i + "']").val();
                var maxPoints = $("input[name='maxPoints-" + i + "']").val();
                var partnerable = $("input[name='partnerable-" + i + "']:checked").val();
                var file = {
                    name: filename,
                    maxPoints: maxPoints,
                    partnerable: partnerable
                };
                files.push(file);
            }

            // Create the assignment object
            var assignment = {
                id: id,
                name: aName,
                due: due,
                files: files
            };
            console.log(assignment);

            $http({
                method: "POST",
                url: "/course/" + courseId + "/saveAssignment",
                data: assignment
            }).success(function(data) {
                console.log("saved assignment");
                location.reload();
            });

            // Remove the editable class
            var table = $(e).parents("table");
            table.removeClass("editable");
        };
    });

})();


/**
 * Adds a row to the table so that another file can be added.
 * TODO: Use a template for html for security
 */
function addFile(e) {
    var table = $(e).parents('table');
    var addNewRow = $(e).parents('.addNew');
    var index = addNewRow.index() - 1;

    // Make sure this is actual html somehow
    var html = '<tr class="newFile">' +
        '<td>' +
        '<input type="text" name="filename-' + index + '" placeholder="File Name">' +
        '</td>' +
        '<td>' +
        'Points: ' +
        '<input type="number" class="score" name="maxPoints-' + index + '" placeholder="Points">' +
        '</td>' +
        '<td>' +
        'Partner: ' +
        '<input type="radio" name="partnerable-' + index + '" value="true">Yes ' +
        '<input type="radio" name="partnerable-' + index + '" checked="true" value="false">No ' +
        '</td>' +
        '</tr>';

    addNewRow.before(html);
};


/**
 * Make an assignment editable. This means that we show input elements instead of
 * the actual values.
 */
function makeEditable(e) {
    var table = $(e).parents("table");
    table.addClass("editable");
    $('.editable .edit').trigger("edit");
};