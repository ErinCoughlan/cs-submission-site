//
//  Spring 2014 - Erin Coughlan & Philip Davis & Luke Sedney

// for the benefit of JSLint:
/*global angular*/

var submissionApp = angular.module('submissionApp', ['ngRoute', 'submissionFilters']);

(function(){
  "use strict";

    // define routes
    submissionApp.config(function($routeProvider, $locationProvider) {
        $routeProvider.when('/student/assignments/:assignmentId', {
            templateUrl: '/partials/student_assignment.html',
            controller: 'StudentAssignmentCtrl',
            controllerAs: 'assignment'
        });
    });

    // define routes
    submissionApp.config(function($routeProvider, $locationProvider) {
        $routeProvider.when('/grader/assignments/:assignmentId', {
            templateUrl: '/partials/grader_assignment.html',
            controller: 'GraderAssignmentCtrl',
            controllerAs: 'assignment'
        });
    });

    // define routes
    submissionApp.config(function($routeProvider, $locationProvider) {
        $routeProvider.when('/grader/students/:studentId', {
            templateUrl: '/partials/grader_student.html',
            controller: 'GraderStudentCtrl',
            controllerAs: 'assignment'
        });
    });

    submissionApp.directive("uiEditable", function () {
        return {
            restrict: 'A',
            link: function (scope, element, attrs) {
                /**
                 * The information for inline editing assignments.
                 * The item will become editable when an "edit" event is fired.
                 * The only way to submit is through the submit button, but
                 * we hide the button on each element and instead group them
                 * and manually call submit.
                 */
                element.editable(function(value) {
                    // We are handling the actual submit in another function
                    return value;
                }, {
                    event     : "edit",
                    style     : 'display: inline',
                    onblur    : 'ignore',
                    submit    : 'invisible'
                });
            }
        };
    });

})();
