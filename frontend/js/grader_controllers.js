//
//  Spring 2014 - Erin Coughlan & Philip Davis & Luke Sedney

// for the benefit of JSLint:
/*global submissionApp, angular, document, alert, console, FormData, $, window, location*/


(function() {
    "use strict";
    var courseId;

    submissionApp.controller('GraderCtrl', function($scope, $http, $route, $routeParams, $location) {
        this.$route = $route;
        this.$location = $location;
        this.$routeParams = $routeParams;

        var splitUrl = $location.absUrl().split('/');
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

                $http.get('/students/' + $scope.courseid).success(
                    function(data) {
                        $scope.students = data.students;
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

            }
        );


        // set the default left column view to assignment
        $scope.view = "assignments";

        // indicates whether the path is currently active
        $scope.isActive = function(path) {
            if ($location.path().substr(0, path.length) == path) {
                return true;
            } else {
                return false;
            }
        };
    });

    submissionApp.controller('GraderAssignmentCtrl', function($scope, $http, $routeParams) {
        $scope.isDefined = function(item) {
            return angular.isDefined(item) && (item !== null);
        };

        var params = $routeParams;

        // get the list of all courses (eventually for the given user)
        $http.get('/courses').success(
            function(data) {
                $scope.courses = data.courses;

                if (courseId) {
                    var index = $scope.courses.map(function(e) {
                        return e.name;
                    }).indexOf(courseId);
                    $scope.course = $scope.courses[index];
                    $scope.courseid = $scope.courses[index].name;
                } else {
                    $scope.course = $scope.courses[0];
                    $scope.courseid = $scope.courses[0].name;
                }

                // get the list of files for the assignment
                $http.get('/grader/course/' + $scope.courseid + '/assignment/' + params.assignmentId).success(
                    function(data) {
                        $scope.assignment = data.assignment;
                        $scope.files = data.files;
                        $scope.students = data.students;
                    }
                );
            }
        );
    });


    submissionApp.controller('GraderStudentCtrl', function($scope, $http, $routeParams) {
        $scope.isDefined = function(item) {
            return angular.isDefined(item) && (item !== null);
        };

        var params = $routeParams;

        // get the list of all courses (eventually for the given user)
        $http.get('/courses').success(
            function(data) {
                $scope.courses = data.courses;

                if (courseId) {
                    var index = $scope.courses.map(function(e) {
                        return e.name;
                    }).indexOf(courseId);
                    $scope.course = $scope.courses[index];
                    $scope.courseid = $scope.courses[index].name;
                } else {
                    $scope.course = $scope.courses[0];
                    $scope.courseid = $scope.courses[0].name;
                }

                // get the list of files for the assignment

                $http.get('/grader/course/' + $scope.courseid + '/student/' + params.studentId + "/").success(
                    function(data) {
                        $scope.assignments = data.course.assignments;
                        $scope.files = data.files;
                        $scope.student = data.student;
                    }
                );
            }
        );
    });

    submissionApp.controller('GradePageCtrl', function($scope, $http, $routeParams, $location) {
        $scope.isDefined = function(item) {
            return angular.isDefined(item) && (item !== null);
        };

        // TODO: I don't know why $location.url() is empty;
        var splitURL = $location.absUrl().split('/');
        var startIndex = splitURL.indexOf("course");

        // TODO: Handle errors (i.e. startIndex == -1)
        $scope.splitURL = splitURL;
        $scope.courseName = splitURL[startIndex + 1];
        $scope.assignmentName = splitURL[startIndex + 3];
        $scope.studentName = splitURL[startIndex + 5];
        $scope.fileName = splitURL[startIndex + 7];
        $scope.courseid = submissionApp.courseid;


        var infoURL = "/course/" + $scope.courseName;
        infoURL += "/assignment/" + $scope.assignmentName;
        infoURL += "/student/" + $scope.studentName;
        infoURL += "/file/" + $scope.fileName;
        infoURL += "/grade";
        var postURL = infoURL;

        // TODO: Be less lazy, use a separate variable rather than splitting
        //       up the +=es

        $scope.saveGrade = function saveGrade($event) {
            var form = document.getElementById("form-grade");
            var fd = new FormData(form);

            var grade = $("input[name='score']").val();
            var graderComments = $("input[name='graderComment']").val();

            var dataStr = JSON.stringify({
                grade: grade,
                graderComments: graderComments
            });


            $http({
                url: postURL,
                data: dataStr,
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            }).success(function(m) {
                console.log(m);
                window.location.href = "/home";
            }).error(function(m) {
                console.log(m);
            });

        };

        this.params = $routeParams;

        infoURL += "/info/";

        this.params = $routeParams;
        $scope.infoURL = infoURL;
        $http.get(infoURL).success(
            function(data) {
                $scope.course = data.course;
                $scope.file = data.file;
                $scope.student = data.student;
                $scope.grader = data.grader;
                $scope.template = data.template;
            });
    });



})();


/**
 * Helper which calls toggle with the correct parent
 */
function toggleRow(e) {
    toggleRowChildren($(e), 'fixedHeader');
}


/**
 * Toggles all of the rows under a given header.
 */
function toggleRowChildren(parentRowElement, parentClass) {
    console.log(parentRowElement);
    // escape periods because jquery thinks they are selectors
    var childClass = parentRowElement.attr('id');
    $('tr.' + childClass, parentRowElement.parent()).toggle();
    $('tr.' + childClass).each(function() {
        if ($(this).hasClass(parentClass) && !$(this).hasClass('collapsed')) {
            toggleRowChildren($(this), parentClass);
        }
    });
    parentRowElement.toggleClass('collapsed');
}


function gradeUnsubmitted(e) {
    e.stopPropagation();
    var grade = parseInt(prompt("What grade would you like to give all unsubmitted assignments?", 0));
}
