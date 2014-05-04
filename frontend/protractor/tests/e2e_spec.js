describe('e2e', function() {

    var ptor = protractor.getInstance();

    var base_url = 'http://localhost:3000/';

    // load the login page, give it some time. 
    // synchronization makes protractor wait for angular to load. 
    // we set it to ignore for now because there is no angular on the login page.
    ptor.ignoreSynchronization = true;
    // we use .driver when the page doesn't have angular
    ptor.driver.get(base_url);
    ptor.wait(
        function() {
            return ptor.driver.getCurrentUrl().then(
                function(url) {
                    console.log(url);
                    return base_url == url;
                });
        }, 5000, 'It\'s taking too long to load ' + base_url + '!'
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
        var url = ptor.getCurrentUrl();
        expect(url).toEqual(base_url + 'home');
    });

    it('should default to CS5', function() {
        var course = $('li[ng-show="altCourses.length>0"] a');
        expect(course.getText()).toEqual('CS5');
    });

    var assignment = element(by.repeater('assignment in assignments'));

    it('should see the first assignment', function() {
        expect(assignment.getText()).toContain('Homework 1');
    });

    it('should show first assignment file when clicked', function() {
        assignment.click();
        var file_name= $('#files-table tr:first-child td:first-child');
        expect(file_name.getText()).toEqual('python.py');
    });

    it('should go to prof view', function() {
        ptor.get(base_url + 'prof');
        var url = ptor.getCurrentUrl();
        expect(url).toEqual(base_url + 'prof');
    });

    it('should go to grader view', function() {
        $("a[href='/grader/course/CS5']").click();
        var url = ptor.getCurrentUrl();
        expect(url).toEqual(base_url + 'grader/course/CS5');
    });

});