//
//  Spring 2014 - Erin Coughlan & Philip Davis & Luke Sedney

// for the benefit of JSLint:
/*global angular*/

var submissionApp = angular.module('submissionApp', ['ngRoute']);

(function(){
  "use strict";

    // define routes
    submissionApp.config(function($routeProvider, $locationProvider) {
        $routeProvider.when('/student/assignments/:assignmentId', {
            templateUrl: 'partials/student_assignment.html',
            controller: 'StudentAssignmentCtrl',
            controllerAs: 'assignment'
        });
    });

    // define routes
    submissionApp.config(function($routeProvider, $locationProvider) {
        $routeProvider.when('/grader/assignments/:assignmentId', {
            templateUrl: 'partials/grader_assignment.html',
            controller: 'GraderAssignmentCtrl',
            controllerAs: 'assignment'
        });
    });

    submissionApp.directive('fileModel', ['$parse', function ($parse) {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                var model = $parse(attrs.fileModel);
                var modelSetter = model.assign;

                element.bind('change', function(){
                    scope.$apply(function(){
                        modelSetter(scope, element[0].files[0]);
                    });
                });
            }
        };
    }]);

})();
