angular.module('submissionFilters', []).filter('letters', function() {
  return function(input) {
  	if (input) {
    	return input.replace(/[^A-Za-z0-9]/gi,'');
    }
  };
});
