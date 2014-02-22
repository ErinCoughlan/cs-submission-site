//
//  Spring 2014 - Erin Coughlan & Philip Davis & Luke Sedney

// for the benefit of JSLint:
/*global angular*/

(function () {
    "use strict";
    
    var submissionApp = angular.module('submissionApp', []);

    submissionApp.controller('StudentCtrl', function ($scope, $http) {

        // get the list of assignments from jsonstub.
        $http.get('http://jsonstub.com/spring2014/cs130/assignments', {
            headers: {
                'JsonStub-User-Key': '2d70b72a-502e-4fbd-9a8f-c9246b9d0fff',
                'JsonStub-Project-Key': 'cc74f36f-3235-4d8b-bfdc-4a94cdedad45'
            }
        }).success(function (data) {
            $scope.assignments = data;
        });

    });
    
}());
