const express = require("express");
const exphbs = require("express-handlebars");
const session = require("express-session");
const fileStore = require('session-file-store')(session);
const flash = require('express-flash');

const app = express();

const conn = require('./db/conn');

const port = 3000;

// import routes
const authRoutes = require('./routes/authRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const publicationsRoutes = require('./routes/publicationsRoutes');
const staticsRoutes = require('./routes/staticsRoutes');
const storeRoutes = require('./routes/storeRoutes');

// import controllers
const publicationsController = require('./controllers/publicationsController');

// models
const Users = require("./models/Users");

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

// root user
const bcript = require('bcryptjs');

const root = async () => {
    try {
        const exist = await Users.findOne({
            where: {
                name: 'root'
            }
        })
        if (!exist) {
            const hashedPassword = await bcript.hash('220201101', 10)

            await Users.create({
                name: 'root',
                email: 'hbw3.gustavo@gmail.com',
                password: hashedPassword,
                perfil: 'https://media.discordapp.net/attachments/1140798008573841488/1140803065839100004/837F5723-7C8B-4167-A583-1C4355804C64.gif?ex=6577a825&is=65653325&hm=2e65bf08e2a6060394d9a0ce90735ba67e6d83613472f98487f840fbb8d50da2&=&width=590&height=590',
                banner: 'https://media.discordapp.net/attachments/1140798008573841488/1157515589644992532/IMG_2663.jpg?ex=657d15e6&is=656aa0e6&hm=8f7d2f4f2bcf2d3439b4988b6bcc61eeaf8a4b0b232ef9417298a33ea27a05ff&=&format=webp&width=1050&height=590'
            })
            console.log('Usuário root criado com sucesso.');
        } else {
            console.log('Usuário root já existe.');
        }
    } catch (error) {
        console.log(error)
    }
}

root();

// routes
app.use('/', authRoutes);
app.use('/perfil', perfilRoutes);
app.use('/publications', publicationsRoutes);
app.use('/static', staticsRoutes);
app.use('/store', storeRoutes);

app.get('/', publicationsController.showHome);

// page not found
app.use((req, res, next) => {
    res.status(404).render('statics/err');
});

conn.sync({ force: false }).then(() => {
    app.listen(port)
}).catch((error) => console.log(error))