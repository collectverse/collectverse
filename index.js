const express = require('express');
const exphbs = require('express-handlebars');
const pool = require('./db/conn.js');

const app = express();

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(express.json());

app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static('public'));

app.get("/", (req, res) => {

    let page = 'CollectVerse - Home'

    res.render('home', { page })
});

app.listen(3000)
console.log(`Conectou à aplicação!\nVisualize com 'localhost/3000' em seu navegador`);