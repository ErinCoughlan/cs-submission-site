//
//  Spring 2014 - Erin Coughlan & Philip Davis & Luke Sedney

// for the benefit of JSLint:
/*global angular*/

var submissionApp = angular.module('submissionApp', ['ngRoute']);

(function(){
  "use strict";

    // define routes
    submissionApp.config(function($routeProvider, $locationProvider) {
        $routeProvider.when('/assignments/:assignmentId', {
            templateUrl: 'partials/assignment.html',
            controller: 'AssignmentCtrl',
            controllerAs: 'assignment'
        });
    });

})();

function submit(e) {
	e.preventDefault();

	var form = document.getElementById('form-submit');
	form.reset();
}
