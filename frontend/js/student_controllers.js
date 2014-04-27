//
//  Spring 2014 - Erin Coughlan & Philip Davis & Luke Sedney

// for the benefit of JSLint:
/*global submissionApp, angular, document, alert, console, FormData, location*/


(function(){
    "use strict";
    var courseId;

    submissionApp.controller('StudentCtrl', function ($scope, $http, $route, $routeParams, $location) {
        this.$route = $route;
        this.$location = $location;
        this.$routeParams = $routeParams;

        var splitUrl = $location.absUrl().split('/');
        var indexCourse = splitUrl.indexOf("course");
        if (indexCourse != -1) {
            courseId = splitUrl[indexCourse+1];
        }


        // get the list of all courses (eventually for the given user)
        $http.get('/courses').success(
            function (data) {
                $scope.courses = data.courses;

                var index;

                if (courseId) {
                    index = $scope.courses.map(function(e) { return e.name; }).indexOf(courseId);
                    $scope.course = $scope.courses[index];
                    $scope.courseid = $scope.courses[index].name;
                } else {
                    $scope.course = $scope.courses[0];
                    $scope.courseid = $scope.courses[0].name;
                }

                // get the list of assignments
                $http.get('/assignments/'+$scope.courseid).success(
                    function (data) {
                        $scope.assignments = data.assignments;
                    }
                );

                // Remove the current course and sort the rest for the dropdown
                var altCourses = $scope.courses;
                index = altCourses.map(function(e) { return e.name; }).indexOf($scope.courseid);
                if (index > -1) {
                    altCourses.splice(index, 1);
                }
                altCourses.sort(function(a,b) {
                    if (a.name === b.name) {
                        return 0;
                    } else if (a.name > b.name) {
                        return 1;
                    } else {
                        return -1;
                    }
                });

                $scope.altCourses = altCourses;
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

    submissionApp.controller('StudentAssignmentCtrl', function ($scope, $http, $routeParams) {
        $scope.isDefined = function (item){
            return angular.isDefined(item) && (item !== null);
        };

        var params = $routeParams;

        // get the list of all courses (eventually for the given user)
        $http.get('/courses').success(
            function (data) {
                $scope.courses = data.courses;

                if (courseId) {
                    var index = $scope.courses.map(function(e) { return e.name; }).indexOf(courseId);
                    $scope.course = $scope.courses[index];
                    $scope.courseid = $scope.courses[index].name;
                } else {
                    $scope.course = $scope.courses[0];
                    $scope.courseid = $scope.courses[0].name;
                }


                // TODO: These routes should be combined into one route
                // get the list of files for the assignment
                $http.get('/course/' + $scope.courseid + '/assignment/' + params.assignmentId).success(
                    function (data) {
                        console.log(data);
                        $scope.assignment = data.assignment;
                        $scope.files = data.files;

                        // try to get files for currently-logged-in student
                        $http.get('/course/' + $scope.courseid + '/assignment/' +
                            params.assignmentId + '/student').success(
                                function (data) {
                                    console.log("combinedfiles", data);
                                    $scope.combinedFiles = data.combinedFiles;
                                }
                            );
                    }
                );
            }
        );

        // submit files and comments
        $scope.submit = function submit($event) {
            var assignmentname = $scope.assignment.name;
            console.log($scope, $scope.assignment, $scope.assignment.files);
            var fd = new FormData();
            var comments = {};
            $scope.combinedFiles.forEach(function(file){
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

            $http.post('/course/'+$scope.courseid+'/assignment/'+assignmentname+'/', fd, {
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
