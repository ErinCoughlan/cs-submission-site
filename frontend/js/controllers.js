//
//  Spring 2014 - Erin Coughlan & Philip Davis & Luke Sedney

// for the benefit of JSLint:
/*global submissionApp, angular, document, alert, console*/


(function(){
    "use strict";

    submissionApp.controller('StudentCtrl', function ($scope, $http, $route, $routeParams, $location) {
        this.$route = $route;
        this.$location = $location;
        this.$routeParams = $routeParams;

        // TODO: get this from the server during page load somehow.
        // maybe a <script src="/courses.js"></script> in student.html
        // with a route on the server that supplies the list of courses?
        var courseid = "CS5";

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

        $scope.changeEmail = function changeEmail($event) {
            var form = document.getElementById("email-form");
            var fd = new FormData(form);

            var emailAddr = document.getElementById('email').value;

            var dataStr = JSON.stringify({ email : emailAddr });

            $.ajax({
                url : "/changemail",
                data : dataStr,
                type : "POST",
                contentType : "application/json",
                success : function(m) {
                    console.log(m);
                    window.location.href="/cs5";
                },
                failure : function (m) {
                    console.log(m);
                }
            });
        };

        $scope.changePassword = function changePassword($event) {
            var form = document.getElementById("password-form");
            var fd = new FormData(form);

            var pw = document.getElementById('password').value;

            var dataStr = JSON.stringify({ password : pw });  

            $.ajax({
                url : "/changepw",
                data : dataStr,
                type : "POST",
                contentType: "application/json",
                success: function(m){
                    console.log(m);
                    window.location.href="/cs5";
                },
                failure: function(m){
                    console.log(m);
                }
            });
            /*
            .success(function(m){
                console.log(m);
                window.location.href="/cs5";
            })
            .error(function(m){
                console.log(m);
            });
*/
        }
    });

    submissionApp.controller('AssignmentCtrl', function ($scope, $http, $routeParams) {
        $scope.isDefined = angular.isDefined;

        this.params = $routeParams;

        // get the list of files for the assignment

        $http.get('/course/' + courseid + '/assignment/' + this.params.assignmentId).success(
            function (data) {
                $scope.assignment = data;
            }
        );

        // submit files and comments
        $scope.submit = function submit($event) {
            var assignmentid = $scope.assignment._id;
            console.log($scope, $scope.assignment, $scope.assignment.files);
            var fd = new FormData();
            var comments = {}
            $scope.assignment.files.forEach(function(file){
                console.log(file);
                if(file.file_to_submit){
                    console.log(file.file_to_submit);
                    fd.append(file.id, file.file_to_submit);
                }
                if(file.comment_to_submit){
                    comments[file.id] = file.comment_to_submit
                }
            });
            fd.append("comments", JSON.stringify(comments));
            $http.post("/submit/" + assignmentid, fd, {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
            .success(function(m){
                console.log(m);

                // TODO: only refresh the right column (table)
                location.reload();
            })
            .error(function(m){
                console.log(m);
            });
        };

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
