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

    var assignment = document.getElementById('assignment').value;
    alert(assignment);

    // Printing out the files that were uploaded
    var inputs = document.querySelectorAll('input[type=file]');
    for (var i= 0; i < inputs.length; i++) {
        var input = inputs[i];

        // Determine if any files were uploaded
        var files = input.files;
        if (files) {
            for (var j = 0; j < files.length; j++) {
                var row = $(input).closest('tr');
                var filename = $(row).find('input[type=hidden]').val();
                alert(filename);

                alert(files[j].name);
            }
        }
    }

    // Replace this with an actual submit call
    var form = document.getElementById('form-submit');
    form.reset();
};
