const Publications = require('../models/Publications');
const Users = require('../models/Users');

// helpers
const { checkurl } = require('../helpers/checkurl');

module.exports = class PerfilController {

    static async showUser(req, res) {
        try {
            const userId = req.params.id;

            const user = await Users.findOne({ where: { id: userId } });

            if (!user) {
                return res.status(404).render('statics/err');
            }

            const perfilIsTheUser = req.session.userid == userId;

            const allComments = await Publications.findAll({
                where: { UserId: userId },
                include: 'User',
                order: [['createdAt', 'DESC']]
            });

            const mapAllComments = allComments.map((comment) => {
                const commentData = comment.dataValues;
                commentData.userHasComment = commentData.User.id === req.session.userid;
                commentData.hasImage = checkurl(commentData.image);
                return commentData;
            });

            res.render('perfil/user', { user: user.dataValues, perfilIsTheUser, comment: mapAllComments });
        } catch (error) {
            console.error(error);
        }
    }

    static async editUserPerfil(req, res) {
        try {
            const { id, name, email, perfil, banner } = req.body;

            const emailExist = await Users.findOne({ where: { email: email } });

            if (emailExist && emailExist.id !== id) {
                req.flash('message', 'E-mail já em uso!');
                return res.redirect('/');
            }

            const userExists = await Users.findOne({ where: { name } });

            if (userExists && userExists.id !== id) {
                req.flash('message', 'Nome de usuário já em uso!');
                return res.redirect('/');
            }

            const user = await Users.findByPk(id);

            if (user) {
                user.name = name || user.name;
                user.email = email || user.email;
                user.perfil = perfil || user.perfil;
                user.banner = banner || user.banner;

                await user.save();
                req.flash('message', 'Informações salvas com sucesso.');
                res.redirect(`/perfil/user/${user.id}`);
            } else {
                req.flash('message', 'Erro do sistema, tente novamente!');
            }
        } catch (error) {
            console.error(error);
        }
    }
};
