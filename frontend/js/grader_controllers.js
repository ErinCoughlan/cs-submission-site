//
//  Spring 2014 - Erin Coughlan & Philip Davis & Luke Sedney

// for the benefit of JSLint:
/*global submissionApp, angular, document, alert, console, FormData, $, window, location*/


(function(){
    "use strict";

    // TODO: get this from the server during page load somehow.
    // maybe a <script src="/courses.js"></script> in student.html
    // with a route on the server that supplies the list of courses?
    submissionApp.courseid = "CS5";

    submissionApp.controller('GraderCtrl', function ($scope, $http, $route, $routeParams, $location) {
        this.$route = $route;
        this.$location = $location;
        this.$routeParams = $routeParams;

        $scope.courseid = submissionApp.courseid;

        // get the list of assignments
        $http.get('/assignments/'+ $scope.courseid).success(
            function (data) {
                $scope.course = data.course;
                $scope.assignments = data.assignments;
            }
        );

        $http.get('/students/' + $scope.courseid).success(
            function(data) {
                $scope.students = data.students;
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


        $scope.changeEmail = function changeEmail($event) {
            var form = document.getElementById("email-form");
            var fd = new FormData(form);

            var emailAddr = document.getElementById('email').value;

            var dataStr = JSON.stringify({ email : emailAddr });

            $.ajax({
                url : "/changemail",
                data : dataStr,
                type : "POST",
                contentType : "application/json",
                success : function(m) {
                    console.log(m);
                    window.location.href="/cs5";
                },
                failure : function (m) {
                    console.log(m);
                }
            });
        };

        $scope.changePassword = function changePassword($event) {
            var form = document.getElementById("password-form");
            var fd = new FormData(form);

            var pw = document.getElementById('password').value;

            var dataStr = JSON.stringify({ password : pw });

            $.ajax({
                url : "/changepw",
                data : dataStr,
                type : "POST",
                contentType: "application/json",
                success: function(m){
                    console.log(m);
                    window.location.href="/cs5";
                },
                failure: function(m){
                    console.log(m);
                }
            });
        };
    });

    submissionApp.controller('GraderAssignmentCtrl', function ($scope, $http, $routeParams) {
        $scope.isDefined = function (item){
            return angular.isDefined(item) && (item !== null);
        };

        $scope.courseid = submissionApp.courseid;

        this.params = $routeParams;

        // get the list of files for the assignment
        $http.get('/grader/course/' + submissionApp.courseid + '/assignment/' + this.params.assignmentId).success(
            function (data) {
                $scope.course = data.course;
                $scope.assignment = data.assignment;
                $scope.files = data.files;
                $scope.students = data.students;
            }
        );
    });

    submissionApp.controller('GradePageCtrl', function ($scope, $http, $routeParams) {
        $scope.isDefined = function (item){
            return angular.isDefined(item) && (item !== null);
        };

        $scope.courseid = submissionApp.courseid;

        this.params = $routeParams;

        $http.get('/course/' + submissionApp.courseid + '/assignment/' + this.params.assignmentId + '/student/' + this.params.student + '/file/' + this.params.file + '/grade/info/').success(
            function (data) {
                console.log(data);
                $scope.course = data.course;
                $scope.file = data.file;
                $scope.student = data.student;
                $scope.grader = data.grader;
            }
        );

    });



})();

/**
 * Helper which calls toggle with the correct parent
 */
function toggleRow(e) {
    // Convert to jquery object so methods will work
    var row = document.getElementById(e.id);
    toggleRowChildren($(row), 'fixedHeader');
};

/**
 * Toggles all of the rows under a given header.
 */
function toggleRowChildren(parentRowElement, parentClass) {
    console.log(parentRowElement);
    // escape periods because jquery thinks they are selectors
    var childClass = parentRowElement.attr('id');
    $('tr.'+childClass, parentRowElement.parent()).toggle();
    $('tr.'+childClass).each(function(){
        if ($(this).hasClass(parentClass) && !$(this).hasClass('collapsed')) {
            toggleRowChildren($(this), parentClass);
        }
    });
    parentRowElement.toggleClass('collapsed');
};

function gradeUnsubmitted(e) {
    e.stopPropagation();
    var grade = parseInt(prompt("What grade would you like to give all unsubmitted assignments?",0));
};
