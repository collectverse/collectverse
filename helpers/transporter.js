const nodemailer = require("nodemailer")

// credenciais do email de SMTP

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'collectverse.corp@gmail.com',
        pass: '3v#Tdgr4' // senha
    }
});

module.exports = transporter;