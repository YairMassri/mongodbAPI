const port = process.env.PORT || 2394;
const express = require('express');
const app = express();
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const databases = require('./databases')();

require('./app/passport')(passport); // pass passport for configuration

//parse the requst body
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs'); // set up ejs for templating

//purpose of this is to enable cross domain requests
// Add headers
app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:2394');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

//requierd for passport
app.set('trust proxy', 1); // trust first proxy

app.use(session({
    secret: 'mysecret',
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: false
    }
}));

//set up flash massages
app.use(flash());

app.use(passport.initialize());
// Persistent login sessions
app.use(passport.session());

// Expose our assets (css, js, images, etc..)
app.use("/", express.static(__dirname + "/assets"));

require('./app/routes')(app, passport);

app.listen(port, function (err) {
    if (err) return console.log('error ', err);

    console.log("Server listening on port " + port);
});

