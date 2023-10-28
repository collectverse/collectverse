const express = require("express");
const exphbs = require("express-handlebars");
const session = require("express-session");
const pool = require("./connection/conn.js");

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: "f2f2nt234-fb23t3wtg23-5n6hrr",
  resave: false,
  saveUninitialized: true,
}));
app.use(express.json());

app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");
app.use(express.static("public"));

// Define route handlers using a more organized structure
app.get("/", (req, res) => {
  res.render("home", { page: "CollectVerse - Home" });
});

app.get("/terms", (req, res) => {
  res.render("terms", { page: "CollectVerse - Termos" });
});

app.get("/ladings", (req, res) => {
  res.render("ladings", { page: "CollectVerse - Lading Page" });
});

app.get("/auth", (req, res) => {
  res.render("auth", { page: "CollectVerse - Authentication" });
});

app.post("/user/auth/register", (req, res) => {
  const { username, email, password } = req.body;
  let termsandprivacy = req.body.termsandprivacy;
  const created_at = new Date().toISOString().slice(0, 19).replace('T', ' ');

  if (termsandprivacy == 'on') {
    termsandprivacy = true
  } else {
    termsandprivacy = false
  }

  const sql = 'INSERT INTO ?? (??, ??, ??, ??, ??, ??) VALUES (?, ?, ?, ?, ?, ?)';
  const data = ['users', 'username', 'email', 'password', 'terms', 'created_at', 'updated_at', username, email, password, termsandprivacy, created_at, created_at];

  pool.query(sql, data, (err) => {
    if (err) {
      console.log(err);
      return;
    }
    res.redirect('/');
  });
});

app.post("/user/auth/login", (req, res) => {
  const { userauth, passwordauth } = req.body;
  const sql = 'SELECT ?? FROM ?? WHERE ?? = ? AND ?? = ?';
  const data = ['username', 'users', 'username', userauth, "password", passwordauth];

  pool.query(sql, data, (err, result) => {
    if (err) {
      console.log(err);
      return;
    }
    res.render('home', { dados: result[0] });
  });
});

// Define a 404 handler for unknown routes
app.use((req, res, next) => {
  res.status(404).render("err");
});

const port = 3000;
app.listen(port, () => {
  console.log(`Connected to the application!\nView at http://localhost:${port}`);
});
