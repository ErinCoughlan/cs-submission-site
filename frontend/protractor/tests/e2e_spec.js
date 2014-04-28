describe('e2e', function() {

    var ptor = protractor.getInstance();

    var original_url = 'http://localhost:3000/';

    //load the login page, give it some time
    ptor.ignoreSynchronization = true;
    ptor.driver.get(original_url);
    ptor.wait(
        function() {
            return ptor.driver.getCurrentUrl().then(
                function(url) {
                    console.log(url);
                    return original_url == url;
                });
        }, 2000, 'It\'s taking too long to load ' + original_url + '!'
    );

    it('should have logic', function() {
        expect(3).toEqual(3);
    });

    it('should log in to the home page', function() {
        $("input[name='username']").sendKeys('testuser');
        $("input[name='password']").sendKeys('pass');
        $("input[value='Log In']").click();

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

    it('should show first assignment files when clicked', function() {
        assignment.click();
        // wait for element to exist after clicking before trying to read it
        var file_name_selector = '#files-table tr:first-child td:first-child';
        ptor.wait(function(){
            return ptor.isElementPresent(by.css(file_name_selector));
        });
        expect($(file_name_selector).getText()).toEqual('python.py');
    });       
});