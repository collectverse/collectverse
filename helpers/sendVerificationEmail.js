const nodemailer = require("nodemailer");

async function sendVerificationEmail(req, res, email, token) {
    const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false, // true para 465, false para 587
        auth: {
            user: process.env.EMAIL, // seu e-mail do Outlook
            pass: process.env.EMAIL_PASSWORD // sua senha ou senha de aplicativo
        },
        tls: {
            rejectUnauthorized: false // permite conexões a servidores com certificados não válidos
        }
    });

    const baseUrl = req.protocol + '://' + req.get('host');
    const verificationLink = `${baseUrl}/verify?token=${token}`;

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Ative sua conta',
        html: `<p>Clique no link abaixo para ativar sua conta:</p>
            <a href="${verificationLink}">Ativar Conta</a>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Erro ao enviar o e-mail: ', error);
        } else {
            console.log('E-mail de verificação enviado: ' + info.response);
        }
    });
}

module.exports = sendVerificationEmail;