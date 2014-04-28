describe('login page', function() {

    var ptor = protractor.getInstance();

    var original_url = 'http://localhost:3000/';

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
});