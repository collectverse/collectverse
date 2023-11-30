const Publications = require('../models/Publications');
const Users = require('../models/Users');

// helpers
const { checkurl } = require('../helpers/checkurl');

module.exports = class publicationsController {

    static async showHome(req, res) {

        try {
            const allComments = await Publications.findAll({
                include: 'User'
            });

            const noMoreComments = false;

            if (noMoreComments.length === 0) {
                noMoreComments = true
            }

            const mapAllComments = allComments.map((comment) => {
                const commentData = comment.dataValues;
                commentData.userHasComment = commentData.User.id === req.session.userid;

                commentData.hasImage = checkurl(commentData.image)

                return commentData;
            });

            res.render('publications/home', { comments: mapAllComments, noMoreComments })
        } catch (error) {
            console.log(error)
        }
    }

    static async post(req, res) {

        const infoComment = {
            content: req.body.content,
            image: req.body.image,
            UserId: req.session.userid
        }

        // find user
        const user = await Users.findOne({ where: { id: infoComment.UserId } })

        if (!user) {
            req.flash('message', 'Usuario não encontrado')
            res.render('auth/access')

            return
        }

        try {

            await Publications.create(infoComment);

            req.flash('message', 'Comentário feito com sucesso!')
            res.redirect('/')

        } catch (error) {
            console.log(`Erro ao criar o comentário: ${error}`)
        }

    }

    static async delete(req, res) {

        try {

            const toDelete = req.body.id

            await Publications.destroy({ where: { id: toDelete } })

            res.redirect('/')

        } catch (error) {
            console.log(error)
        }

    }

}