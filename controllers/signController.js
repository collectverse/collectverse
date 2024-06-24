const connection = require("../schema/connection.js");
const bcrypt = require("bcryptjs");

const successMessages = {
    CREATED_ACCOUNT: 'Conta criada com sucesso.',
    LOGIN_ACCOUNT: 'Entrada feita com sucesso.',
    ALTER_PASSWORD: 'Senha alterada com sucesso.'
};

const errorMessages = {
    EMPTY_EMAIL: 'Por favor, insira um endereço de e-mail.',
    EMAIL_IN_USE: 'Este endereço de e-mail já está em uso.',
    EMAIL_NOT_IN_USE: 'Este endereço de e-mail não está em uso.',
    INVALID_EMAIL: 'Por favor, insira um endereço de e-mail válido.',
    EMPTY_USERNAME: 'Por favor, insira um nome de usuário.',
    USERNAME_IN_USE: 'Este nome de usuário já está em uso.',
    WEAK_PASSWORD: 'A senha é muito fraca. Por favor, escolha uma senha mais forte.',
    LIMIT_PASSWORD: 'A senha não deve ter mais de 64 caracteres',
    INCORRECT_PASSWORD: 'A senha está incorreta.',
    INTERNAL_ERROR: 'Erro interno do servidor.',
    NO_SPECIAL_CHARACTERS: 'A senha deve incluir letras maiúsculas, minúsculas, números e caracteres especiais.'
};

const itIsEmail = /S+@S+.S+/;
const wasSpecialCharacters = /[^a-zA-Z0-9]/;

module.exports = class SignController {
    static signIn(req, res) {
        try {
            if (req.session.userid) {
                req.flash("msg", errorMessages.INTERNAL_ERROR);
                return res.status(401).render("layouts/main.ejs", { router: "../pages/sign/signIn.ejs", error: req.flash("msg") });
            }
            res.status(200).render("layouts/main.ejs", { router: "../pages/sign/signIn.ejs" });
        } catch (error) {
            console.log(error)
            req.flash("msg", errorMessages.INTERNAL_ERROR);
            return res.status(500).render("layouts/main.ejs", { router: "../pages/sign/signIn.ejs", error: req.flash("msg"), title: "Collectverse - Entrar" });
        }
    }
    static async makeSignIn(req, res) {
        try {
            const { email, password } = req.body;

            if (itIsEmail.test(email)) {
                req.flash("msg", errorMessages.INVALID_EMAIL);
                return res.status(400).render("layouts/main.ejs", { router: "../pages/sign/signIn.ejs", error: req.flash("msg") });
            } else if (email.length === 0) {
                req.flash("msg", errorMessages.EMPTY_EMAIL);
                return res.status(400).render("layouts/main.ejs", { router: "../pages/sign/signIn.ejs", error: req.flash("msg") });
            }

            // verifica se usuário existe
            const user = await connection.query("SELECT id, email, password FROM users WHERE email = ?", [email]);

            if (!(user[0].length > 0)) {
                req.flash("msg", errorMessages.EMAIL_NOT_IN_USE);
                return res.status(400).render("layouts/main.ejs", { router: "../pages/sign/signIn.ejs", error: req.flash("msg") });
            }

            // verificar se as senhas conheecidem
            const passwordMatch = bcrypt.compareSync(password, user[0][0].password)

            if (!passwordMatch) {
                req.flash('msg', errorMessages.INCORRECT_PASSWORD);
                return res.status(400).render("layouts/main.ejs", { router: "../pages/sign/signIn.ejs", error: req.flash("msg") });
            }

            req.session.userid = user[0][0].id
            return req.session.save(() => {
                req.flash("msg", successMessages.LOGIN_ACCOUNT);
                res.status(200).redirect("/")
            });
        } catch (error) {
            console.log(error)
            req.flash("msg", errorMessages.INTERNAL_ERROR);
            return res.status(500).render("layouts/main.ejs", { router: "../pages/sign/signIn.ejs", error: req.flash("msg") });
        }
    }
    static signUp(req, res) {
        try {
            if (req.session.userid) {
                req.flash("msg", errorMessages.INTERNAL_ERROR);
                return res.status(401).redirect("/")
            }
            res.status(200).render("layouts/main.ejs", { router: "../pages/sign/signUp.ejs" });
        } catch (error) {
            console.log(error)
            req.flash("msg", errorMessages.INTERNAL_ERROR);
            return res.status(500).render("layouts/main.ejs", { router: "../pages/sign/signUp.ejs", error: req.flash("msg"), title: "Collectverse - Registrar"  });
        }
    }
    static async makeSignUp(req, res) {
        try {
            const { email, name, password } = req.body;

            if (itIsEmail.test(email)) {
                req.flash("msg", errorMessages.INVALID_EMAIL);
                return res.status(400).render("layouts/main.ejs", { router: "../pages/sign/signUp.ejs", error: req.flash("msg") });
            } else if (email.length === 0) {
                req.flash("msg", errorMessages.EMPTY_EMAIL);
                return res.status(400).render("layouts/main.ejs", { router: "../pages/sign/signUp.ejs", error: req.flash("msg") });
            }
            if (name.length === 0) {
                req.flash("msg", errorMessages.EMPTY_USERNAME);
                return res.status(400).render("layouts/main.ejs", { router: "../pages/sign/signUp.ejs", error: req.flash("msg") });
            }
            if (!wasSpecialCharacters.test(password)) {
                req.flash("msg", errorMessages.NO_SPECIAL_CHARACTERS);
                return res.status(400).render("layouts/main.ejs", { router: "../pages/sign/signUp.ejs", error: req.flash("msg") });
            }
            if (password.length < 8) {
                req.flash("msg", errorMessages.WEAK_PASSWORD);
                return res.status(400).render("layouts/main.ejs", { router: "../pages/sign/signUp.ejs", error: req.flash("msg") });
            }
            if (password.length > 64) {
                req.flash("msg", errorMessages.LIMIT_PASSWORD);
                return res.status(400).render("layouts/main.ejs", { router: "../pages/sign/signUp.ejs", error: req.flash("msg") });
            }

            // verifica se usuário existe
            const emailWasInDb = await connection.query("SELECT email FROM users WHERE email = ?", [email]);
            const nameWasInDb = await connection.query("SELECT name FROM users WHERE name = ?", [name]);

            if (emailWasInDb[0].length > 0) {
                req.flash("msg", errorMessages.EMAIL_IN_USE);
                return res.status(400).render("layouts/main.ejs", { router: "../pages/sign/signUp.ejs", error: req.flash("msg") });
            }
            if (nameWasInDb[0].length > 0) {
                req.flash("msg", errorMessages.USERNAME_IN_USE);
                return res.status(400).render("layouts/main.ejs", { router: "../pages/sign/signUp.ejs", error: req.flash("msg") });
            }

            // criptografando a senha do usuário.

            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);

            const account = {
                name, email, password: hashedPassword
            }

            // cria o usuário no banco de dados.

            const createdAccont = await connection.query("INSERT INTO users (name, email, password, createdAt, updatedAt) VALUES (?, ?, ?, now(), now())", [account.name, account.email, account.password]);
            const id = createdAccont[0].insertId;
            // cria a tabela de seguidores e seguindo do usuário
            const userWasTableFollows = await connection.query("SELECT id FROM follows WHERE UserId = ?", [id])

            if (userWasTableFollows && userWasTableFollows[0].length > 0) {
                req.flash("msg", errorMessages.INTERNAL_ERROR);
                return res.status(500).render("layouts/main.ejs", { router: "../pages/sign/signUp.ejs", error: req.flash("msg") });
            }

            await Promise.all([
                connection.query("INSERT INTO follows (UserId, followers, following, createdAt, updatedAt) VALUES (?, ?, ?, now(), now())", [id, "[]", "[]"]),
                connection.query("INSERT INTO carts (itemIds, UserId, createdAt, updatedAt) VALUES (?, ?, now(), now())", ["[]", id])
            ]);

            req.session.userid = id;
            return req.session.save(() => {
                req.flash("msg", successMessages.CREATED_ACCOUNT);
                res.status(200).redirect("/")
            });
        } catch (error) {
            console.log(error)
            req.flash("msg", errorMessages.INTERNAL_ERROR);
            return res.status(500).render("layouts/main.ejs", { router: "../pages/sign/signUp.ejs", error: req.flash("msg") });
        }
    }
    static logout(req, res) {
        try {
            req.session.destroy(() => {
                res.status(200).redirect("/sign/in");
            });
        } catch (error) {
            console.log(error)
            req.flash("msg", errorMessages.INTERNAL_ERROR);
            return res.status(500).redirect("/");
        }
    }
    static async recover(req, res) {
        try {
            res.status(200).render("layouts/main.ejs", { router: "../pages/sign/recover.ejs", title: "Collectverse - Recuperação"  });
        } catch (error) {
            console.log(error)
            req.flash("msg", errorMessages.INTERNAL_ERROR);
            return res.status(500).redirect("/");
        }
    }
    static async makeRecover(req, res) {
        try {
            const { email, password } = req.body;

            if (itIsEmail.test(email)) {
                req.flash("msg", errorMessages.INVALID_EMAIL);
                return res.status(400).render("layouts/main.ejs", { router: "../pages/sign/recover.ejs", error: req.flash("msg") });
            } else if (email.length === 0) {
                req.flash("msg", errorMessages.EMPTY_EMAIL);
                return res.status(400).render("layouts/main.ejs", { router: "../pages/sign/recover.ejs", error: req.flash("msg") });
            }

            // verifica se usuário existe
            const user = await connection.query("SELECT id, email, password FROM users WHERE email = ?", [email]);

            console.log(user[0][0].id)

            if (!(user[0].length > 0)) {
                req.flash("msg", errorMessages.EMAIL_NOT_IN_USE);
                return res.status(400).render("layouts/main.ejs", { router: "../pages/sign/recover.ejs", error: req.flash("msg") });
            }

            if (!wasSpecialCharacters.test(password)) {
                req.flash("msg", errorMessages.NO_SPECIAL_CHARACTERS);
                return res.status(400).render("layouts/main.ejs", { router: "../pages/sign/signUp.ejs", error: req.flash("msg") });
            }
            if (password.length < 8) {
                req.flash("msg", errorMessages.WEAK_PASSWORD);
                return res.status(400).render("layouts/main.ejs", { router: "../pages/sign/signUp.ejs", error: req.flash("msg") });
            }
            if (password.length > 64) {
                req.flash("msg", errorMessages.LIMIT_PASSWORD);
                return res.status(400).render("layouts/main.ejs", { router: "../pages/sign/signUp.ejs", error: req.flash("msg") });
            }

            // criptografando a senha do usuário.

            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(password, salt);

            await connection.query("UPDATE users SET password = ?, updatedAt = NOW() WHERE id = ?", [hashedPassword, user[0][0].id]);

            req.flash("msg", successMessages.ALTER_PASSWORD);
            res.status(200).redirect("/sign/in")
        } catch (error) {
            console.log(error)
            req.flash("msg", errorMessages.INTERNAL_ERROR);
            return res.status(500).redirect("/");
        }
    }
}