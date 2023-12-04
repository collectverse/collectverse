const Publications = require('../models/Publications');
const Users = require('../models/Users');

// helpers
const { checkurl } = require('../helpers/checkurl');

const ERROR_MESSAGES = {
    USER_NOT_FOUND: 'Usuário não encontrado',
    COMMENT_CREATION_ERROR: 'Erro ao criar o comentário',
};

module.exports = class PublicationsController {

    static async showHome(req, res) {
        try {
            const allComments = await Publications.findAll({
                include: 'User',
                order: [['createdAt', 'DESC']]
            });

            const noMoreComments = allComments.length === 0;

            const mapAllComments = allComments.map((comment) => {
                const commentData = comment.dataValues;
                commentData.userHasComment = commentData.User.id === req.session.userid;
                commentData.hasImage = checkurl(commentData.image);
                return commentData;
            });

            res.render('publications/home', { comment: mapAllComments, noMoreComments });
        } catch (error) {
            console.log(error);
        }
    }

    static async post(req, res) {
        const infoComment = {
            content: req.body.content,
            image: req.body.image,
            UserId: req.session.userid
        };

        try {
            const user = await Users.findByPk(infoComment.UserId);

            if (!user) {
                req.flash('message', ERROR_MESSAGES.USER_NOT_FOUND);
                return res.render('auth/access');
            }

            await Publications.create(infoComment);

            req.flash('message', 'Comentário feito com sucesso!');
            res.redirect('/');
        } catch (error) {
            console.log(`${ERROR_MESSAGES.COMMENT_CREATION_ERROR}: ${error}`);
        }
    }

    static async delete(req, res) {
        try {
            const toDelete = req.body.id;
            await Publications.destroy({ where: { id: toDelete } });
            res.redirect('/');
        } catch (error) {
            console.log(error);
        }
    }
};