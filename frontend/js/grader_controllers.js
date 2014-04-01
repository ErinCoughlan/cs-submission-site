//
//  Spring 2014 - Erin Coughlan & Philip Davis & Luke Sedney

// for the benefit of JSLint:
/*global submissionApp, angular, document, alert, console, FormData, $, window, location*/


(function(){
    "use strict";

    // TODO: get this from the server during page load somehow.
    // maybe a <script src="/courses.js"></script> in student.html
    // with a route on the server that supplies the list of courses?
    submissionApp.courseid = "CS5";

    submissionApp.controller('GraderCtrl', function ($scope, $http, $route, $routeParams, $location) {
        this.$route = $route;
        this.$location = $location;
        this.$routeParams = $routeParams;

        $scope.courseid = submissionApp.courseid;

        // get the list of assignments
        $http.get('/assignments/'+submissionApp.courseid).success(
            function (data) {
                console.log(data);
                $scope.course = data.course;
                $scope.assignments = data.assignments;
            }
        );

        // set the default left column view to assignment
        $scope.view = "assignments";

        // indicates whether the path is currently active
        $scope.isActive = function(path) {
            if ($location.path().substr(0, path.length) == path) {
                return true;
            } else {
                return false;
            }
        };
/*
        $http.get('/students/' + courseid).success(
            function(data) {
                $scope.students = data.students;
            }
        );
*/
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
        };
    });

    submissionApp.controller('GraderAssignmentCtrl', function ($scope, $http, $routeParams) {
        $scope.isDefined = function (item){
            return angular.isDefined(item) && (item !== null);
        };

        $scope.courseid = submissionApp.courseid;

        this.params = $routeParams;

        // get the list of files for the assignment
        $http.get('/course/' + submissionApp.courseid + '/assignment/' + this.params.assignmentId).success(
            function (data) {
                console.log(data);
                $scope.course = data.course;
                $scope.assignment = data.assignment;
                $scope.files = data.files;
            }
        );

       // submit files and comments
        $scope.submit = function submit($event) {
            var assignmentid = $scope.assignment._id;
            console.log($scope, $scope.assignment, $scope.assignment.files);
            var fd = new FormData();
            var comments = {};
            $scope.files.forEach(function(file){
                console.log("file", file);
                if(file.file_to_submit){
                    console.log("to submit", file.file_to_submit);
                    fd.append(file.name, file.file_to_submit);
                }
                if(file.comment_to_submit){
                    comments[file.name] = file.comment_to_submit;
                }
            });
            fd.append("comments", JSON.stringify(comments));

            $http.post('/course/'+$scope.courseid+'/assignment/'+assignmentid+'/', fd, {
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

})();


/** Set up toggling rows for grader view */
$(document).ready(function() {
    $('tr.fixedHeader').click(function () {
        toggleRowChildren($(this), 'fixedHeader');
    });

    function toggleRowChildren(parentRowElement, parentClass) {
        var childClass = parentRowElement.attr('id');
        $('tr.'+childClass, parentRowElement.parent()).toggle();
        $('tr.'+childClass).each(function(){
            if ($(this).hasClass(parentClass) && !$(this).hasClass('collapsed')) {
                toggleRowChildren($(this), parentClass);
            }
        });
        parentRowElement.toggleClass('collapsed');
    }
});
