describe('e2e', function() {

    var ptor = protractor.getInstance();

    var original_url = 'http://localhost:3000/';

    // load the login page, give it some time. 
    // synchronization makes protractor wait for angular to load. 
    // we set it to ignore for now because there is no angular on the login page.
    ptor.ignoreSynchronization = true;
    // we use .driver when the page doesn't have angular
    ptor.driver.get(original_url);
    ptor.wait(
        function() {
            return ptor.driver.getCurrentUrl().then(
                function(url) {
                    console.log(url);
                    return original_url == url;
                });
        }, 5000, 'It\'s taking too long to load ' + original_url + '!'
    );

    // log in
    $("input[name='username']").sendKeys('testuser');
    $("input[name='password']").sendKeys('pass');
    $("input[value='Log In']").click();

    beforeEach(function() {
        // turn sync on again inside the tests.
        browser.ignoreSynchronization = false;
    });

    it('should have logic', function() {
        expect(3).toEqual(3);
    });

    it('should go to the home page', function() {
        // check if we went to the home page 
        var url = ptor.getCurrentUrl();
        expect(url).toEqual('http://localhost:3000/home');
    });

    it('should default to CS5', function() {
        var course = $('li[ng-show="altCourses.length>0"] a');
        expect(course.getText()).toEqual('CS5');
    });

    var assignment = element(by.repeater('assignment in assignments'));

    it('should see the first assignment', function() {
        expect(assignment.getText()).toEqual('Homework 1\nNA/50');
    });

    it('should show first assignment file when clicked', function() {
        assignment.click();
        var file_name= $('#files-table tr:first-child td:first-child');
        expect(file_name.getText()).toEqual('python.py');
    });
});