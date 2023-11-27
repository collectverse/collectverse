const Users = require('../models/Users');

const bcript = require('bcryptjs');

module.exports = class AuthController {

    static access(req, res) {
        res.render('auth/access');
    }

    static async register(req, res) {

        const { name, email, password, confirmpassword } = req.body;

        // password match validation
        if (password != confirmpassword) {
            // mensagem 
            req.flash('message', 'As senhas não conferem, tente novamente!');
            res.render('auth/access')

            return
        }

        // check if user exists
        const checkIfUserExists = await Users.findOne({ where: { email: email } })

        if (checkIfUserExists) {
            // mensagem
            req.flash('message', 'O E-mail já está em uso.');
            res.render('auth/access')

            return
        }

        // create a encripted password
        const salt = bcript.genSaltSync(10);
        const hashedPassword = bcript.hashSync(password, salt);

        const user = {
            name,
            email,
            password: hashedPassword
        }

        try {
            const createdUser = await Users.create(user);

            // inicialize session
            req.session.userid = createdUser.id;

            req.flash('message', 'Cadastro realizado com sucesso!')

            req.session.save(() => {
                res.redirect('/')
            })
        } catch (error) {
            console.log(`Erro ao criar o usuário: ${error}`)
        }

    }

    static async login(req, res) {

        const { name, password } = req.body;

        // find user
        const user = await Users.findOne({ where: { name: name } })

        if (!user) {
            req.flash('message', 'Usuario não encontrado')
            res.render('auth/access')

            return
        }

        // check if password match
        const passwordMatch = bcript.compareSync(password, user.password)

        if (!passwordMatch) {
            req.flash('message', 'Senha incorreta!')
            res.render('auth/access')

            return
        }

        try {
            //  initialize session
            req.session.userid = user.id

            req.flash('message', 'Autentificação realizada, logado com sucesso!')

            req.session.save(() => {
                res.redirect('/')
            })
        } catch (error) {
            console.log(error)
        }

    }

    static logout(req, res) {
        req.session.destroy()
        res.redirect('/access');
    }

}