const nodemailer = require("nodemailer");

async function sendVerificationEmail(req, res, email, token) {
    const transporter = nodemailer.createTransport({
        service: 'Yahoo',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            secure: false,
            ignoreTLS: true,
            rejectUnauthorized: false
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