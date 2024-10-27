const nodemailer = require("nodemailer")

async function sendVerificationEmail(req, res, email, token) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.EMAIL_PASSWORD // senha
        },
        tls: {
            secure: false,
            ignoreTLS: true,
            rejectUnauthorized: false
        }
    })

    const baseUrl = req.protocol + '://' + req.get('host');
    const verificationLink = `${baseUrl}/verify?token=${token}`

    const mailOptions = {
        from: corpEmail,
        to: email,
        subject: 'Ative sua conta',
        text: `Clique no link para ativar sua conta: ${verificationLink}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log('Erro ao enviar o e-mail: ', error);
        } else {
            console.log('E-mail de verificação enviado: ' + info.response);
        }
    });
}

module.exports = sendVerificationEmail