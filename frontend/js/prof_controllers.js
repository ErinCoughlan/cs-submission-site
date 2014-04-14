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

    submissionApp.controller('ProfCtrl', function ($scope, $http, $routeParams) {
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

})();