const nodemailer = require("nodemailer");

async function sendVerificationEmail(req, res, email, token) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
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
    const verificationLink = `${baseUrl}/sign/verify?token=${token}`;

    const htmlForVerify = `
<!DOCTYPE html>
<html lang="en">

<head>

    <!-- metadados -->
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- titulo -->

    <title>Collectverse - Verificação</title>

    <!-- seo -->

    <meta name="description"
        content="Collectverse é uma plataforma online que permite aos usuários agendar consultas, participar de eventos, adquirir itens colecionáveis e interagir com outros usuários.">
    <meta name="keywords" content="Collectverse, Agendamento Online, Eventos, Itens Colecionáveis, Interação Social">
    <meta name="robots" content="index, follow">
    <meta name="author" content="Collectverse">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">

    <!-- Meta Open Graph para redes sociais -->
    <meta property="og:title" content="Collectverse - Sua Plataforma de Interação Online">
    <meta property="og:description"
        content="Agende consultas, participe de eventos, adquira itens colecionáveis e interaja com outros usuários na Collectverse.">
    <!-- <meta property="og:image" content=""> -->
    <!-- <meta property="og:url" content=""> -->
    <meta property="og:type" content="website">

    <!-- Meta Twitter Card para Twitter -->
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="Collectverse - Sua Plataforma de Interação Online">
    <meta name="twitter:description"
        content="Agende consultas, participe de eventos, adquira itens colecionáveis e interaja com outros usuários na Collectverse.">
    <!-- <meta name="twitter:image" content=""> -->

    <!-- --- -->

    <!-- favicon -->
    <link rel="shortcut icon" href="/source/images/logo.svg" type="image/x-icon">

    <!-- Fonte Roboto (assíncrona) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link
        href="https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap"
        rel="stylesheet">
        
    <!-- style.css deferido para carregamento não bloqueante -->
    <link rel="stylesheet" href="/stylesheet/style.css" media="print" onload="this.media='all'">

    </head>
    <main class="main-verify">
        <section class="default-card verify">
            <img src="${baseUrl}/source/images/string.svg" alt="Imagem ilustrativa Collectverse.">
            <br>
            <p>Clique no link abaixo para ativar sua conta</p>
            <a href="${verificationLink}">Ativar Conta</a>
        </section>
    </main>
    `

    const mailOptions = {
        from: process.env.EMAIL,
        to: email,
        subject: 'Ative sua conta',
        html: htmlForVerify
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