const Users = require('../models/Users');

const bcript = require('bcryptjs');

module.exports = class AuthController {

    static login(req, res) {
        res.render('auth/login');
    }

    static register(req, res) {
        res.render('auth/register')
    }

    static logout(req, res) {
        req.session.destroy()
        res.redirect('/login')
    }

}