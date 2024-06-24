const connection = require("../schema/connection");

const errorMessages = {
    INTERNAL_ERROR: 'Erro interno do servidor.'
};

// verifica se o usuário é premium

async function checkPremiumUser(req, res, next) {
    if(!req.session.userid) {
        req.flash("msg", "Usuário não autenticado.")
        return res.status(401).redirect("/sign/in")
    }

    try {
        const account = await connection.query("SELECT id, pass FROM users WHERE id = ?", [req.session.userid])

        if(account[0].length == 0) {
            req.flash("msg", "Usuário não autenticado.")
            return res.status(401).redirect("/sign/in")
        }

        req.isPremium = account[0][0].pass;
        next();
    } catch (error) {
        console.error(error);
        req.flash("msg", errorMessages.INTERNAL_ERROR);
        res.status(500).redirect("/");
    }
}

module.exports = checkPremiumUser