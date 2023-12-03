const Users = require('../models/Users');

module.exports.loadUser = async function (req, res, next) {
    if (req.session.userid) {
        try {
            const currentUser = await Users.findOne({ where: { id: req.session.userid } });
            res.locals.currentUser = currentUser.dataValues;
        } catch (error) {
            console.error(`Erro ao carregar informações do usuário: ${error}`);
        }
    }

    next();
};