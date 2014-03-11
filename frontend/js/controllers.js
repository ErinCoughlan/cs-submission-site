//
//  Spring 2014 - Erin Coughlan & Philip Davis & Luke Sedney

// for the benefit of JSLint:
/*global submissionApp*/


(function(){
    "use strict";

    // define jsonstub headers
    var config = {
        headers: {
            'JsonStub-User-Key': '2d70b72a-502e-4fbd-9a8f-c9246b9d0fff',
            'JsonStub-Project-Key': 'cc74f36f-3235-4d8b-bfdc-4a94cdedad45'
        }
    };

    submissionApp.controller('StudentCtrl', function ($scope, $http, $route, $routeParams, $location) {
        this.$route = $route;
        this.$location = $location;
        this.$routeParams = $routeParams;

        // get the list of assignments from jsonstub.
        $http.get('http://jsonstub.com/spring2014/cs130/assignments', config).success(
            function (data) {
                $scope.assignments = data;
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
        $scope.isDefined = angular.isDefined

        this.params = $routeParams;

        // get the list of files for the first assignment from jsonstub
        // TODO: change from 'assignment/0' to  'assignment/' + this.params.assignmentId 
        $http.get('http://jsonstub.com/spring2014/cs130/assignment/' + this.params.assignmentId, config).success(
            function (data) {
                $scope.assignment = data;
            }
        );
    });

})();
