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

/**
 * Performs a mock submission for any assignments that were uploaded.
 * DO NOT USE: SECURITY FLAWS
 * (and horrendous style)
 */
function mockSubmit(e) {
    e.preventDefault();

    // Printing out the files that were uploaded
    var inputs = document.querySelectorAll('input[type=file]');
    for (var i= 0; i < inputs.length; i++) {
        var input = inputs[i];

        // Locate the first cell in the row
        var rowId = input.parentNode.parentNode;
        var cells = rowId.getElementsByTagName('td');

        // Determine if any files were uploaded
        var files = input.files;
        if (files && cells.length >= 1) {
            for (var j = 0; j < files.length; j++) {
                // This is a security risk and a major flaw, but it will work for the demo
                if (cells[0].innerHTML.indexOf('\n(submitted)') == -1) {
                    cells[0].innerHTML += "\n(submitted)";
                }
            }
        }
    }

    var form = document.getElementById('form-submit');
    form.reset();
}
