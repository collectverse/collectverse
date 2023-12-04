const Users = require('../models/Users');
const bcrypt = require('bcryptjs');

const ERROR_MESSAGES = {
    PASSWORD_MISMATCH: 'As senhas não conferem, tente novamente!',
    EMAIL_IN_USE: 'O E-mail já está em uso.',
    USER_NOT_FOUND: 'Usuario não encontrado',
    INCORRECT_PASSWORD: 'Senha incorreta!',
};

module.exports = class AuthController {

    static access(req, res) {
        res.render('auth/access');
    }

    static async register(req, res) {
        const { name, email, password, confirmpassword } = req.body;

        // Password match validation
        if (password !== confirmpassword) {
            req.flash('message', ERROR_MESSAGES.PASSWORD_MISMATCH);
            return res.render('auth/access');
        }

        // Check if user exists
        const existingUser = await Users.findOne({ where: { email } });

        if (existingUser) {
            req.flash('message', ERROR_MESSAGES.EMAIL_IN_USE);
            return res.render('auth/access');
        }

        // Create an encrypted password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        const user = {
            name,
            email,
            password: hashedPassword
        };

        try {
            const createdUser = await Users.create(user);

            // Initialize session
            req.session.userid = createdUser.id;

            req.flash('message', 'Cadastro realizado com sucesso!');
            req.session.save(() => res.redirect('/'));
        } catch (error) {
            console.error(`Erro ao criar o usuário: ${error}`);
        }
    }

    static async login(req, res) {
        const { name, password } = req.body;

        // Find user
        const user = await Users.findOne({ where: { name } });

        if (!user) {
            flash('message', ERROR_MESSAGES.USER_NOT_FOUND);
            return res.render('auth/access');
        }

        // Check if password matches
        const passwordMatch = bcrypt.compareSync(password, user.password);

        if (!passwordMatch) {
            flash('message', ERROR_MESSAGES.INCORRECT_PASSWORD);
            return res.render('auth/access');
        }

        try {
            // Initialize session
            req.session.userid = user.id;

            req.flash('message', 'Autentificação realizada, logado com sucesso!');
            req.session.save(() => res.redirect('/'));
        } catch (error) {
            console.error(error);
        }
    }

    static logout(req, res) {
        req.session.destroy();
        res.redirect('/access');
    }
};
