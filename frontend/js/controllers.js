//
//  Spring 2014 - Erin Coughlan & Philip Davis & Luke Sedney

// for the benefit of JSLint:
/*global submissionApp, angular*/


(function(){
    "use strict";

    submissionApp.controller('StudentCtrl', function ($scope, $http, $route, $routeParams, $location) {
        this.$route = $route;
        this.$location = $location;
        this.$routeParams = $routeParams;

        // TODO: get this from the server during page load somehow.
        // maybe a <script src="/courses.js"></script> in student.html
        // with a route on the server that supplies the list of courses?
        var courseid = "531ea533e4b0ea5911efe9f6";

        // get the list of assignments
        $http.get('/assignments/'+courseid).success(
            function (data) {
                $scope.course = data;
            }
        );

        // indicates whether the path is currently active
        $scope.isActive = function(path) {
            if ($location.path().substr(0, path.length) == path) {
                return true;
            } else {
                return false;
            }
        };

    });

    submissionApp.controller('AssignmentCtrl', function ($scope, $http, $routeParams) {
        $scope.isDefined = angular.isDefined;

        this.params = $routeParams;

        // get the list of files for the assignment
        $http.get('/assignment/' + this.params.assignmentId).success(
            function (data) {
                $scope.assignment = data;
            }
        );

    });

})();
