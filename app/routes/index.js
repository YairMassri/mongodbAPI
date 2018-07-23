module.exports = function (app, passport) {
    //require the authentication routes
    require('./auth')(app, passport, isLoggedIn);
    //require the viwes routes
    require('./views')(app, isLoggedIn);

    // require('./blog')(app, isLoggedIn);

}

function isLoggedIn(req, res, next) {

    if (req.isAuthenticated())
    return next();

    res.reqirect('/signin');
}