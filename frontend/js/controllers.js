//
//  Spring 2014 - Erin Coughlan & Philip Davis & Luke Sedney

// for the benefit of JSLint:
/*global angular*/

(function () {
    "use strict";
    
    var submissionApp = angular.module('submissionApp', []);
    var config = {
            headers: {
                'JsonStub-User-Key': '2d70b72a-502e-4fbd-9a8f-c9246b9d0fff',
                'JsonStub-Project-Key': 'cc74f36f-3235-4d8b-bfdc-4a94cdedad45'
            }
        };

    submissionApp.controller('StudentCtrl', function ($scope, $http) {

        // get the list of assignments from jsonstub.
        $http.get('http://jsonstub.com/spring2014/cs130/assignments', config).success(
            function (data) {
                $scope.assignments = data;
        });


        // get the list of files for the first assignment from jsonstub
        $http.get('http://jsonstub.com/spring2014/cs130/assignment/0', config).success(
            function (data) {
                $scope.assignment0 = data;
        });

    });
    
}());


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
};
