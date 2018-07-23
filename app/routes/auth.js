// Load async to process the email confirmation
const asynq = require('async');

// Load the nodemailer to send emails
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Load  the user schema from the models to comunicate with the database
const User = require('../models/user');

module.exports = function (app, passport, isLoggedIn) {
    // Handle sign-up
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect: '/signin',// redirect to signin page
        failureRedirect: '/signup',// redirect back to the signup page if there is an error
        failureFlash: true// allow flash messages
    }));

    // Handle sign-in
    app.post('/signin', passport.authenticate('local-signin', {
        successRedirect: '/home',
        failureRedirect: '/signin',

        failureFlash: true
    }));
    // Handle profile update
    app.post('/update_profile', passport.authenticate('local-profile-update', {
        successRedirect: '/update_profile',
        failureRedirect: '/update_profile',

        failureFlash: true
    }));
    // Handle sign-out
    app.get('/sign-out', isLoggedIn, function (req, res) {
        req.logout();
        res.redirect('/signin');
    });
    // Handle the email confirmation
    app.get('/email-confirmation/:emailToken', function (req, res) {
        // console.log("going to the auth.js");
        let token = req.params.emailToken
        console.log("Token ==> " + token);
        asynq.waterfall([
            function (done) {
                User.findOne({ 'emailConfirmationToken': token },
                    function (err, user) {
                        if (!user) {
                            req.flash('sign-up-msg', 'No user found');
                            return res.redirect('/signup');
                        }
                        //Set the EmailConfirmed to true.
                        user.emailConfirmed = true;
                        user.emailConfirmationToken = undefined;

                        user.save(function (err) {
                            console.log("user.save(function (err)");
                            if (err) {
                                req.flash('sign-up-msg', 'Database error');
                                return res.redirect('/signup');
                            }
                            done(err, user);
                        });
                    });
            },
            function (user, done) {
                let smtpTransport = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'server3178@gmail.com',
                        pass: 'port3178'
                    }
                });
                let mailOptions = {
                    to: user.email,
                    from: 'Email Confirmed',
                    subject: 'Your email has been confirmed',
                    text: 'Hello, ' + user.name + '\n\n' + 'This is a confirmation that the email for your account ' + user.email + ' has been confirmed.\n'
                };
                smtpTransport.sendMail(mailOptions);

                req.flash('sign-in-msg', 'Your email has been confirmed');
                return res.redirect('/signin');
            }
        ], function (err) {
            if (err) return console.log(err);
            console.log('Email Confirmed')
        });
    });

    // Handle password recovery
    app.post('/password_recovery', function (req, res, next) {
        asynq.waterfall([
            function (done) {
                crypto.randomBytes(20, function (err, buf) {
                    var token = buf.toString('hex');
                    done(err, token);
                });
            },
            function (token, done) {
                User.findOne({ 'email': req.body.email }, function (err, user) {
                    console.log("auto.js_101")
                    if (!user) {
                        console.log("auto.js_103")
                        req.flash('passwordRecoveryMessage', 'No user found with that email.')
                        return res.redirect('/password_recovery');
                    }
                    console.log("auto.js_107")
                    user.resetPasswordToken = token;
                    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                    user.save(function (err) {
                        done(err, token, user);
                    });
                });
            },
            function (token, user, done) {
                var smtpTransport = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'server3178@gmail.com',
                        pass: 'port3178'
                    }
                });
                var mailOptions = {
                    to: user.email,
                    from: 'Password Recovery',
                    subject: 'Password Reset',
                    html: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                        'http://' + req.headers.host + '/password_reset/' + token + '\n\n' +
                        'Verification Code: ' + token + '\n\n' +
                        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                };

                smtpTransport.sendMail(mailOptions, function (err) {
                    req.flash('passwordRecoveryMessage', 'An e-mail has been sent to ' + user.email + ' with further instructions.')
                    return res.redirect('/password_recovery');
                    done(err, 'done');
                });
            }
        ], function (err) {
            if (err) return next(err);
            console.log('password reset email sent');
        });
    });

    app.get('/password_reset/:token', function (req, res) {
        User.findOne({ 'resetPasswordToken': req.params.token, 'resetPasswordExpires': { $gt: Date.now() } },
            function (err, user) {
                if (!user) {
                    console.log("auto.js_151")
                    req.flash('passwordRecoveryMessage', 'No user found with that email.');
                    return res.redirect('/password_recovery');
                }
                else {
                    console.log("auto.js_156")
                    req.flash('passwordResetMessage', 'You can now change your password')
                    res.render('password_reset.ejs', { message: req.flash('passwordResetMessage') });
                }

            });
    });

    app.post('/password_reset/:token', function (req, res) {
        asynq.waterfall([
            function (done) {
                User.findOne({
                    'resetPasswordToken': req.params.token, 'resetPasswordExpires': { $gt: Date.now() }
                },
                    function (err, user) {
                        if (!user) {
                            req.flash('passwordRecoveryMessage', 'No user found with that email.')
                            return res.redirect('/password_recovery');
                        }
                        else if (req.body.new_password !== req.body.new_password_confirmation) {
                            req.flash('passwordResetMessage', 'Passwords do not match.')
                            res.render('password_reset.ejs', { message: req.flash('passwordResetMessage') });
                        }
                        else {
                            user.password = user.generateHash(req.body.new_password);
                            user.resetPasswordToken = undefined;
                            user.resetPasswordExpires = undefined;

                            user.save(function (err) {
                                req.login(user, function (err) {
                                    done(err, user);
                                });
                            });
                        }
                    });
            },
            function (user, done) {
                var smtpTransport = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'server3178@gmail.com',
                        pass: 'port3178'
                    }
                });
                var mailOptions = {
                    to: user.email,
                    from: 'Password Changed',
                    subject: 'Your password has been changed',
                    text: 'Hello,\n\n' +
                        'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
                };
                smtpTransport.sendMail(mailOptions, function (err) {
                    req.flash('signinMessage', 'Your password was succesfully reseted');
                    return res.redirect('/signin');
                    done(err);
                });
            }
        ], function (err) {
            console.log('password changed');
        });
    });
}