const connection = require("../schema/connection.js");
const returnFollowersAndFollowing = require("../helpers/followingAndFollowersreturn.js");

const successMessages = {
    CREATED_PUBLISH: 'Publicação feita com sucesso.',
    DELETE_PUBLISH: 'Publicação excluída com sucesso.'
};

const errorMessages = {
    INVALID_SESSION: 'Erro ao validar sessão do usuário.',
    EMPTY_TEXT: 'Para fazer uma publicação deve preencher a área de texto.',
    INTERNAL_ERROR: 'Erro interno do servidor.',
    USER_NOT_FOUND: 'Usuário não encontrado.',
    NOT_FOUND: 'Não encontrado.'
};

module.exports = class MainController {
    static async home(req, res) {
        try {

            if(!(req.session.userid)){
                return res.status(401).redirect("/sign/in")
            }

            // consulta o usuário logado
            const account = await connection.query("SELECT users.id, users.name, users.email, users.perfil, users.banner, users.biography, users.points, users.pass, follows.followers, follows.following FROM users INNER JOIN follows ON users.id = follows.UserId WHERE users.id = ?", [req.session.userid]);
            // consulta os comentários
            const publications = await connection.query("SELECT publications.* , users.name, users.perfil, users.pass FROM publications INNER JOIN users ON publications.UserId = users.id ORDER BY createdAt DESC");
            // consulta os usuários com mais seguidores
            const highlights = await connection.query("SELECT users.id, users.name, users.perfil, users.pass, follows.followers FROM users INNER JOIN follows ON users.id = follows.UserId ORDER BY follows.followers ASC LIMIT 3");
            // consulta as notificações do usuário logado
            const notifications = await connection.query("SELECT * FROM notify WHERE parentId = ? ORDER BY createdAt DESC", [req.session.userid]);

            let forFollowers = [];
            let forFollowing = [];

            if (req.session.userid) {
                const { resultForFollowers, resultForFollowing } = await returnFollowersAndFollowing(req.session.userid);

                forFollowers = resultForFollowers
                forFollowing = resultForFollowing

            }

            res.status(200).render("layouts/main.ejs", { router: "../pages/home/home.ejs", publications: publications[0], user: account[0][0], highlights: highlights[0], followers: forFollowers, following: forFollowing, notifications: notifications[0], title: "Collectverse - Home" });
        } catch (error) {
            console.error(error);
            req.flash("error", errorMessages.INTERNAL_ERROR);
            res.status(500).redirect("/");
        }
    }
    static async publish(req, res) {
        try {
            const { user, message } = req.body;

            if (!user || user.length === 0) {
                req.flash("error", errorMessages.INVALID_SESSION);
                return res.status(401).redirect("/");
            }
            if (!message || message.length === 0) {
                req.flash("error", errorMessages.EMPTY_TEXT);
                return res.status(400).redirect("/");
            }

            let publishImagePath = "";
            if (req.files && req.files["image"]) {
                publishImagePath = req.files["image"][0].filename;
            }

            // verificando se usuário existe
            const account = await connection.query("SELECT id, name FROM users WHERE id = ?", [user]);

            if (account[0].length == 0) {
                req.flash("error", errorMessages.USER_NOT_FOUND);
                return res.status(401).redirect("/");
            }

            // cria o comentário no banco de dados.
            const parentId = req.body.parentId || 0;
            const publication = await connection.query("INSERT INTO publications (text, userId, image, likesByUsersIds ,parentId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, now(), now())", [message, user, publishImagePath, '[]', parentId]);

            if (parentId !== 0 && parentId !== user) {
                const content = `${account[0][0].name} Respondeu seu comentário.`
                await connection.query("INSERT INTO notify (UserId, ifCommented ,parentId, type, content, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())", [user, publication[0].insertId, parentId, "response", content]);
            }

            req.flash("success", successMessages.CREATED_PUBLISH);
            res.status(200).redirect("/");
        } catch (error) {
            console.error(error);
            req.flash("error", errorMessages.INTERNAL_ERROR);
            res.status(500).redirect("/");
        }
    }
    static async deletePublication(req, res) {
        try {
            const id = req.params.id;

            // verifica se o comentário pertense ao usuário da sessão
            const publication = await connection.query("SELECT UserId FROM publications WHERE id = ?", [id]);

            if (publication.length === 0 || publication[0][0].UserId !== req.session.userid) {
                req.flash("error", errorMessages.INTERNAL_ERROR);
                return res.status(400).redirect("/");
            }

            // exclui o comentário
            await connection.query("DELETE FROM publications WHERE id = ?", [id]);

            req.flash("success", successMessages.DELETE_PUBLISH);
            res.status(200).redirect("/");
        } catch (error) {
            console.log(error)
            req.flash("error", errorMessages.INTERNAL_ERROR);
            return res.status(500).redirect("/");
        }
    }
    static async likePublication(req, res) {
        try {
            const id = req.body.id;
            const user = req.body.user;

            // Obter as informações do comentário atual
            const publication = await connection.query("SELECT likes, likesByUsersIds FROM publications WHERE id = ? LIMIT 1", [id]);
            const account = await connection.query("SELECT id, name FROM users WHERE id = ?", [req.session.userid]);

            // Verificar se o usuário já curtiu o comentário
            let likedByUserIds = JSON.parse(publication[0][0].likesByUsersIds || '[]');
            if (likedByUserIds.includes(req.session.userid)) {
                // Remova o ID do usuário da lista
                likedByUserIds = likedByUserIds.filter(id => id !== req.session.userid);

                // Atualize o número de curtidas e a lista de IDs no banco de dados
                const updatedLikes = publication[0][0].likes - 1;

                // Atualizar o banco de dados
                await connection.query('UPDATE publications SET likes = ?, likesByUsersIds = ?, updatedAt = now() WHERE id = ?', [updatedLikes, JSON.stringify(likedByUserIds), id]);

                return res.status(200).redirect("/");
            }

            const updatedLikes = publication[0][0].likes + 1;
            likedByUserIds.push(req.session.userid);

            // Atualizar o banco de dados
            await connection.query('UPDATE publications SET likes = ?, likesByUsersIds = ?, updatedAt = now() WHERE id = ?', [updatedLikes, JSON.stringify(likedByUserIds), id]);

            const content = `${account[0][0].name} Curtiu seu comentário`
            await connection.query("INSERT INTO notify (UserId, parentId, ifLiked, type, content, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, NOW(), NOW())", [req.session.userid, user, id, "like", content]);

            return res.status(200).redirect("/");
        } catch (error) {
            console.log(error)
            req.flash("error", errorMessages.INTERNAL_ERROR);
            return res.status(500).redirect("/");
        }
    }
    static async publication(req, res) {
        try {
            const id = req.params.id;

            // consulta das publicações
            const publication = await connection.query("SELECT publications.*, users.name, users.perfil, users.pass FROM publications INNER JOIN users ON publications.UserId = users.id WHERE publications.id = ? ORDER BY publications.createdAt DESC", [id]);

            if (publication[0].length == 0) {
                req.flash("error", errorMessages.NOT_FOUND);
                return res.status(404).redirect("/");
            }

            const publications = await connection.query("SELECT publications.*, users.name, users.perfil FROM publications INNER JOIN users ON publications.UserId = users.id WHERE publications.parentId = ? ORDER BY publications.createdAt DESC", [id]);
            // consulta do usuário logado
            const account = await connection.query("SELECT name, email, perfil, points, pass FROM users WHERE id = ?", [req.session.userid]);

            const notifications = await connection.query("SELECT * FROM notify WHERE parentId = ? ORDER BY createdAt DESC", [req.session.userid]);

            if (account.length === 0) {
                req.flash("error", errorMessages.INTERNAL_ERROR);
                return res.status(500).redirect("/");
            }

            res.render("layouts/main", { router: "../pages/home/publication.ejs", publication: publication[0][0], publications: publications[0], user: account[0][0], notifications: notifications[0], title: `Collectverse - Publicação de ${publication[0][0].name}`  });
        } catch (error) {
            console.log(error)
            req.flash("error", errorMessages.INTERNAL_ERROR);
            return res.status(500).redirect("/");
        }
    }
}