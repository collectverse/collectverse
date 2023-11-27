const express = require("express");
const exphbs = require("express-handlebars");
const session = require("express-session");
const fileStore = require('session-file-store')(session);
const flash = require('express-flash');

const app = express();

const conn = require('./db/conn');

const port = 3000;

// models
const Publications = require('./models/Publications');
const Users = require('./models/Users');

// import routes
const publicationsRoutes = require('./routes/publicationsRoutes');
const authRoutes = require('./routes/authRoutes');
const staticsRoutes = require('./routes/staticsRoutes');

// import controllers
const publicationsController = require('./controllers/publicationsController');
const staticsController = require('./controllers/StaticsController');

// helpers
const loadUser = require('./helpers/loadUser').loadUser

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(express.json());

// session middleware
app.use(
    session({
        name: 'session',
        secret: 'wNc8-8W1i',
        resave: true,
        saveUninitialized: false,
        store: new fileStore({
            logFn: function () { },
            path: require('path').join(require('os').tmpdir(), 'sessions'),
        }),
        cookie: {
            secure: false,
            maxAge: 3600000,
            expires: new Date(Date.now() + 3600000),
            httpOnly: true,
        },
    }),
);

// helpers
app.use(loadUser);

// flash message
app.use(flash());

app.use(express.static('public'));

// set session to res
app.use((req, res, next) => {
    if (req.session.userid) {
        res.locals.session = req.session;
    }
    next();
});

// routes
app.use('/', authRoutes);
app.use('/publications', publicationsRoutes);
app.use('/static', staticsRoutes);

app.get('/', publicationsController.showHome);

// page not found
app.use((req, res, next) => {
    res.status(404).render('statics/err');
});

conn.sync({ force: false }).then(() => {
    app.listen(port)
}).catch((error) => console.log(error))