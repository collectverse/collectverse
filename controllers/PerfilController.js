const Publications = require('../models/Publications');
const Users = require('../models/Users');

// helpers
const { checkurl } = require('../helpers/checkurl');

module.exports = class PerfilController {
    static async showUser(req, res) {
        try {
            const userId = req.params.id;

            const user = await Users.findOne({ where: ({ id: userId }) });

            if (!user) {
                return res.status(404).render('statics/err');
            }

            let perfilIsTheUser = false;

            if (req.session.userid == userId) {
                perfilIsTheUser = true;
            }

            // check for user had posts

            const allComments = await Publications.findAll({
                where: ({ id: userId }),
                include: 'User',
                order: [['createdAt', 'DESC']]
            });

            let noMoreComments = false;

            if (allComments.length === 0) {
                noMoreComments = true;
            }

            const mapAllComments = allComments.map((comment) => {
                const commentData = comment.dataValues;
                commentData.userHasComment = commentData.User.id === req.session.userid;

                commentData.hasImage = checkurl(commentData.image)

                return commentData;
            });

            res.render('perfil/user', { user: user, perfilIsTheUser, comments: mapAllComments });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Erro interno do servidor' });
        }
    }
};
