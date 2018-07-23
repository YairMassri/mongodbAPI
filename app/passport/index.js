// Load all the things we need
const LocalStrategy = require('passport-local').Strategy;

// Load the crypto module
const crypto = require('crypto');

// Load the nodemailer to send emails
const nodemailer = require('nodemailer');

// Load  the user schema from the models to comunicate
const User = require('../models/user');




module.exports = function (passport) {
    //======================
    //Passport session setup
    //======================

    // Used to serializeUser the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // Used to deserializeUser the user
    passport.deserializeUser(function (id, done) {
        User.findById(id, function (err, user) {
            done(err, user)
        });
    });

    //======================
    //Local admin signin
    //======================

    passport.use('local-signin', new LocalStrategy({
        //By default, local strategy uses username and password, we will override with email.

        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass in the requst from our route (lets us check if a user is logged in or not)
    }, function (req, email, password, done) {
        if (email)
            email = email.toLowerCase(); // Use the lower-case emails to avoid case sensetive..

        process.nextTick(function () {
            User.findOne({
                'email': email
            }, function (err, user) {
                if (err) return done(err);

                //if user is not found, return message
                else if (!user) {
                    return done(null, false, req.flash('sign-in-msg', 'No user found.'));
                }

                // if password is invalid, return message
                else if (!user.isValidPassword(password)) {
                    return done(null, false, req.flash('sign-in-msg', 'Oops! Worng password'));
                }

                // if email hasn't been confirmed, return message
                else if (!user.isEmailConfirmed) {
                    return done(null, false, req.flash('sign-in-msg', 'Your email has not been confirmed yet'));
                }

                // all is well, return user
                else
                    return done(null, user);
            });
        });
    }));

    //======================
    //Local admin signup
    //======================

    passport.use('local-signup', new LocalStrategy({
        //By default, local strategy uses username and password, we will override with email.

        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass in the requst from our route (lets us check if a user is logged in or not)
    }, function (req, email, password, done) {
        console.log("auth is working")
        if (email)
            email = email.toLowerCase(); // Use the lower-case emails to avoid case sensetive..

        process.nextTick(function () {
            // if the user is not already logged in:
            if (!req.user) {
                User.findOne({
                    'email': email
                }, function (err, user) {
                    console.log("if (!req.user) is working")
                    if (err, user, password) {
                        console.log("if (err, user, password) is also working")

                        // if there is any error, return the error
                        if (err) {
                            console.log("getting an error")
                            return done(err);
                        }

                        // check to see if there is already a user with that email
                        if (user) {
                            return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                        }

                        // check if passwords match
                        else if (password !== req.body.password_confirmation) {
                            return done(null, false, req.flash('signupMessage', 'Passwords do not match.'))
                        }

                        // if everything is good, register the user information and wait for email verification
                        else {
                            console.log("going to create a newUser")
                            // Create an email token
                            let emailHash = crypto.randomBytes(20).toString("hex");
                            // Create the user
                            let newUser = new User();
                            newUser.email = email;
                            newUser.password = newUser.generateHash(password);
                            newUser.name = req.body.name;
                            newUser.dob = req.body.dob;
                            newUser.emailConfirmed = false;
                            newUser.emailConfirmationToken = emailHash;

                            newUser.save(function (err) {
                                console.log(" newUser is working");

                                if (err) {
                                    console.log(" error");
                                    return done(err);
                                }

                                let smtpTransport = nodemailer.createTransport({
                                    service: 'gmail',
                                    auth: {
                                        user: 'server3178@gmail.com',
                                        pass: 'port3178'
                                    }
                                });

                                let mailOptions = {
                                    to: email,
                                    from: 'My Blog',
                                    subject: 'Hi ' + newUser.name + ', here is your email verfication',
                                    text: "Please click in the link below to confirm your email address or copy and paste in your browser url bar \n\n http://" +
                                        req.headers.host + "/email-confirmation/" + emailHash, html: `
                                    <p>
                                    Please click in the link below to <br/>
                                    <a 
                                    href='http://${req.headers.host}/email-confirmation/${emailHash}'>
                                    confirm your email address
                                    </a>
                                    </p>
                                    `
                                };

                                console.log('saving the user in the db');
                                smtpTransport.sendMail(mailOptions).then(() => {
                                    console.log('email was succesfully sent')
                                })
                                .catch(err => {
                                    console.log('error sending email', err)
                                });

                                return done(null, newUser, req.flash('sign-in-msg', 'A verification email has been sent to ' + email));
                            });
                        }
                    } else {
                        console.log(" is working")
                        return done(null, req.user);
                    }
                })
            }

        });
    }));
    //======================
    // Local update strategy
    //======================

    passport.use('local-profile-update', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true // allows us to pass in the req from our route (lets us check if a user is logged in or not)
    },
        function (req, email, password, done) {
            if (email) email = email.toLowerCase(); // Use lower-case e-mails to avoid case-sensitive e-mail matching
            // asynchronous
            process.nextTick(function () {
                // if the user is not already logged in:
                if (!req.user) {
                    return done(null, false, req.flash('update-profile-msg', 'You must be logged in to update your profile information'));
                }

                // if password is invalid, return message
                else if (!req.user.isValidPassword(password)) {
                    return done(null, false, req.flash('update-profile-msg', 'Oops! Wrong password'));
                }

                else {
                    var user = req.user;
                    if (req.body.new_password && req.body.new_password_confirmation && req.body.new_password === req.body.new_password_confirmation) {
                        user.password = user.generateHash(req.body.new_password);
                    }

                    user.name = req.body.name;
                    user.dob = req.body.dob;

                    user.save(function (err) {
                        if (err)
                            return done(err);

                        return done(null, user, req.flash('update-profile-msg', 'Profile updated successfully!'));
                    });
                }
            });
        }));
}


