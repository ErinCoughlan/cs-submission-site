module.exports = function(app, passport) {
    app.get('/settings', isLoggedIn, function(req, res) {
        res.render('settings');
    });
    
    // Make this whole mechanism less sketch
    app.post('/changemail', function(req, res) {
        console.log("Changing your email");
        if(req.isAuthenticated()) {
            user = req.user;
            user.local.email = req.body.email;
            console.log(user);
            user.save(function(err) {
                if(err) {
                    console.log("Error saving user email");
                    throw err;
                }
            });
        }
        res.redirect('/cs5');
    });
    
    app.post('/changepw', isLoggedIn, function(req, res) {
        user = req.user;
        // TODO HOLY SHIT WE ARE POSTING PLAINTEXT PASSWORDS FIXME
        pw = req.body.password;
        console.log(pw);
        user.local.password = user.generateHash(pw);
        user.save(function(err) {
        if(err) {
            console.log("Error saving user password");
            throw err;
        }
        });
        res.redirect('/cs5');
    });
};

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();

    // if they aren't, redirect them to the home page
    res.redirect('/');
}
