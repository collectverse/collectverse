const Publications = require('../models/Publications');
const Users = require('../models/Users');

module.exports = class publicationsController {

    static async showHome(req, res) {
        res.render('publications/home')
    }

    static async postComment(req, res) {

        const infoComment = {
            content: req.body.content,
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

        } catch (error) {
            console.log(`Erro ao criar o comentário: ${error}`)
        }

    }

}