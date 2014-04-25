//
//  Spring 2014 - Erin Coughlan & Philip Davis & Luke Sedney

// for the benefit of JSLint:
/*global submissionApp, angular, document, alert, console, FormData, $, window, location*/


(function(){
    "use strict";

    submissionApp.controller('ProfCtrl', function ($scope, $http, $route, $routeParams, $location) {
        this.$route = $route;
        this.$location = $location;
        this.$routeParams = $routeParams;

        // get the list of all courses (eventually for the given user)
        $http.get('/courses').success(
            function (data) {
                $scope.courses = data.courses;
                $scope.course = $scope.courses[0];
                $scope.courseid = $scope.courses[0].name;

                // get the list of assignments
                $http.get('/assignments/'+$scope.courseid).success(
                    function (data) {
                        //$scope.course = data.course;
                        $scope.assignments = data.assignments;
                    }
                );

                // Remove the current course and sort the rest for the dropdown
                var altCourses = $scope.courses;
                var index = altCourses.map(function(e) { return e.name; }).indexOf($scope.course.name);
                if (index > -1) {
                    altCourses.splice(index, 1);
                }
                altCourses.sort(function(a,b) {
                    if (a.name === b.name) {
                        return 0;
                    } else if (a.name > b.name) {
                        return 1;
                    } else {
                        return -1;
                    }
                });

                $scope.altCourses = altCourses;

                $http.get('/students/'+$scope.courseid).success(
                  function (data) {
                    data.students.sort(function(a,b) {
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

                $http.get('/graders/'+$scope.courseid).success(
                  function (data) {
                    data.graders.sort(function(a,b) {
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
            var areGraders   = document.getElementById('grader').checked;

            var dataStr = JSON.stringify({ students: studentsText,
                                          grader: areGraders });


            $.ajax({
                url : "/addStudents/course/" + $scope.course.name,
                data : dataStr,
                type : "POST",
                contentType : "application/json",
                success : function(m) {
                    console.log(m);
                    window.location.href="/prof/addStudent";
                },
                failure : function (m) {
                    console.log(m);
                }
            });
        };


        $scope.removeUsers = function addUsers($event) {
            var form = document.getElementById("form-add-student");
            var fd = new FormData(form);

            var studentRemoves = [];

            $scope.students.forEach(function(specificStudent) {
              var foo= specificStudent.name + "Checked";
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


            var dataStr = JSON.stringify({ students: studentRemoves,
                                              grader: graderRemoves });


            $.ajax({
                url : "/removeStudents/course/" + $scope.course.name,
                data : dataStr,
                type : "POST",
                contentType : "application/json",
                success : function(m) {
                    console.log(m);
                    window.location.href="/prof/addStudent";
                },
                failure : function (m) {
                    console.log(m);
                }
            });
        };

    });

})();


/**
 * Adds a row to the table so that another file can be added
 */
function addFile(e) {
    var table = $(e.target).parents('table');
    console.log(table);

    var index = $('#addNew').index() - 1;

    // Make sure this is actual html somehow
    var html = '<tr class="file">'+
                    '<td>'+
                        '<input type="text" name="filename-'+index+'" placeholder="File Name">'+
                    '</td>'+
                    '<td>'+
                        'Points: '+
                        '<input type="number" class="score" name="maxPoints-'+index+'" placeholder="Points">'+
                    '</td>'+
                    '<td>'+
                        'Partner: '+
                        '<input type="radio" name="partnerable-'+index+'" value="true">Yes '+
                        '<input type="radio" name="partnerable-'+index+'" checked="true" value="false">No '+
                    '</td>'+
                '</tr>';

    $('#addNew').before(html);
}

/**
 * Create a new assignment (NO ACTUAL SUBMIT FOR NOW)
 */
 function createAssignment() {
    var aName = $("input[name='assignmentName'").val();
    var due = $("input[name='dueDate'").val();
    var files = [];

    var rows = $(".file");
    for (var i = 0; i < rows.length; i++) {
        var filename = $("input[name='filename-"+i+"']").val();
        var maxPoints = $("input[name='maxPoints-"+i+"']").val();
        var partnerable = $("input[name='partnerable-"+i+"']:checked").val();
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
        due: due,
        files: files
    };

    addAssignment(assignment);
    clearAssignment();
 }

 /**
  * Clears all data within the new assignment form
  */
function clearAssignment() {
    $("input[name='assignmentName'").val('');
    $("input[name='dueDate'").val('');

    var rows = $(".file");
    for (var i = 0; i < rows.length; i++) {
        $("input[name='filename-"+i+"']").val('');
        $("input[name='maxPoints-"+i+"']").val('');
        $("input[name='partnerable-"+i+"'][value='false']").prop('checked', true);
    }
}

/**
 * Add an assignment to the HTML. (SHOULD USE NODE AND REFRESH WITH NEW ASSIGNMENT)
 * input: assignment - {name: , due: , files:[file1, file2]}
 */
function addAssignment(assignment) {
    var date = new Date(assignment.due);
    var html = '<table cellspacing="0" cellpadding="0">'+
                    '<tr id="'+assignment.name+'" class="fixedHeader">'+
                        '<th colspan="2">'+
                            '<a class="underline" ng-href="/edit">'+
                                assignment.name+
                            '</a>'+
                        '</th>'+
                        '<th class="alignRight">'+
                            'Due: '+date.toDateString()+date.toTimeString()+
                        '</th>'+
                    '</tr>';
    var moreHtml = "";
    for (var i = 0; i < assignment.files.length; i++) {
        var file = assignment.files[i];
        moreHtml += '<tr ng-repeat="file in assignment.files">'+
                        '<td>'+
                            file.name+
                        '</td>'+
                        '<td>'+
                            'Points: '+file.maxPoints+
                        '</td>'+
                        '<td>'+
                            'Partner: '+file.partnerable+
                        '</td>'+
                    '</tr>';
                }
    var finalHtml = html + moreHtml + '</table>';

    $('#newAssignment').before(finalHtml);
}
