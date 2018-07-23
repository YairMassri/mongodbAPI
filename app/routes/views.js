const format = require('../methods/format')

module.exports = function (app, isLoggedIn) {

    app.get('/', function (req, res) {
        if (req.user) {
            res.redirect('/home');
        } else {
            res.render('signin.ejs');
        }
    });

    app.get('/home', isLoggedIn, function (req, res) {
        res.render('home.ejs', {
            user: req.user
        });
    });
    
    app.get('/add_article', isLoggedIn, function (req, res) {
        res.render('add_article.ejs', {
            user: req.user
        });
    });

    app.get('/password_recovery', function (req, res) {
        res.render('password_recovery.ejs',{
            message: req.flash('passwordRecoveryMessage')

        });
    });

    app.get('/password_reset', function (req, res) {
        res.render('password_reset.ejs', {
            message: req.flash('passwordResetMessage')
        });
    });

    app.get('/profile', isLoggedIn, function (req, res) {
        res.render('profile.ejs', {
            user: req.user
        });
    });

    app.get('/signin', function (req, res) {
        res.render('signin.ejs', {
            message: req.flash('sign-in-msg')
        });
    });

    app.get('/signup', function (req, res) {
        res.render('signup.ejs', {
            message: req.flash('sign-up-msg')
        });
    });

    app.get('/update_profile', isLoggedIn, function (req, res) {
        res.render('update_profile.ejs', {
            message: req.flash('update-profile-msg'),
            user: {
                ...req.user,
                dob: format.date(new Date(req.user.dob), 'yyyy/mm/dd').date,
                name: req.user.name,
                email: req.user.email
            }
        });
    });

    app.get('*', function (req, res) {
        res.render('404.ejs');
    });
    
}