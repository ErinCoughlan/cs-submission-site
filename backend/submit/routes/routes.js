var fs = require('fs');

module.exports = function(app, passport) {
    fs.readdirSync(__dirname).forEach(function(file) {
        console.log(file);
        if (file === "routes.js" || file.substr(0,1) == '#' || file.substr(0,1) == '.' || file.substr(file.lastIndexOf('.') + 1) !== 'js' || file.substr(-1) == '~') {
            return;
        }
        var name = file.substr(0, file.indexOf('.'));
        require('./' + name)(app, passport);
    });
};
