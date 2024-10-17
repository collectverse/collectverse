require('dotenv').config();

// Importando as dependências
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require("path");
const mysql = require('mysql2');
const FileStore = require('session-file-store')(session);
const mercadopago = require('mercadopago');

// Configurando o app
const app = express();

// Configurando o EJS como mecanismo de visualização
app.set('view engine', 'ejs');

// arquivos estaticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configurando o middleware para parsing
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Configurando o cookie parser
app.use(cookieParser());

// Configurando a sessão
app.use(session({
    store: new FileStore(),
    secret: 'fane-hwsn-2tgb-3b23',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Configurando o flash para mensagens de erro/sucesso
app.use(flash());

// configuração do mercadoPago
// mercadopago.configure({
//     access_token: process.env.ACCESS_TOKEN_SANDBOX,
// });

// mensagem
app.use((req, res, next) => {
    res.locals.error = req.flash("error") || [];
    res.locals.success = req.flash("success") || [];
    res.locals.msg = req.flash("msg") || [];
    next();
});

// variaveis globais

app.use((req, res, next) => {
    res.locals.userid = req.session.userid;
    next();
});

// rotas

const MainRoutes = require("./routes/mainRoutes.js");
const ProfileRoutes = require("./routes/profileRoutes.js");
const SignRoutes = require("./routes/signRoutes.js");
const StoreRoutes = require("./routes/storeRoutes.js");

app.use("/", MainRoutes);
app.use("/profile", ProfileRoutes);
app.use("/sign", SignRoutes);
app.use("/store", StoreRoutes);

app.get('/', (req, res) => {
    res.render('layouts/main.ejs', req.query);
});

// Middleware para tratar erros 404 (recurso não encontrado)
app.use((req, res, next) => {
    res.status(404).render("layouts/notFound.ejs");
});

// Iniciando o servidor
app.listen(3000, () => {
    console.log('Servidor rodando');
});
