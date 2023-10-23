const express = require("express");
const exphbs = require("express-handlebars");
const session = require("express-session");
const pool = require("./db/conn.js");

const app = express();

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(
  session({
    secret: "f2f2nt234-fb23t3wtg23-5n6hrr",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(express.json());

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");

app.use(express.static("public"));

app.get("/", (req, res) => {
  let page = "CollectVerse - Home";

  res.render("home", { page });
});

app.get("/auth", (req, res) => {
  let page = "CollectVerse - Autentificação";

  res.render("auth", { page });
});

app.post("/user/auth/register", (req, res) => {

  let { username, email, password, confirmpassword, termsandprivacy } = req.body;
  let created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');


  if (termsandprivacy == 'on') {
    termsandprivacy = true
  } else {
    termsandprivacy = false
  }

  const sql = 'INSERT INTO ?? (??, ??, ??, ??, ??, ??) VALUES (?, ?, ?, ?, ?, ?)';
  const data = ['users', 'username', 'email', 'password', 'terms', 'created_at', 'updated_at', username, email, password, termsandprivacy, created_at, created_at];

  pool.query(sql, data, function (err) {
    if (err) {
      console.log(err)
      return
    }
    res.redirect('/')
  });

});

app.post("/user/auth/login", (req, res) => {

  let { userauth, passwordauth } = req.body;

})

app.use(function (req, res, next) {

  res.status(404).render("404");

})

app.listen(3000);
console.log(
  `Conectou à aplicação!\nVisualize com 'localhost/3000' em seu navegador`
);
