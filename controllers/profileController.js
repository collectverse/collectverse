const connection = require("../schema/connection");
const bcrypt = require("bcryptjs");
const itIsEmail = /S+@S+.S+/;
const wasSpecialCharacters = /[^a-zA-Z0-9]/;
const successMessages = {
    EDITED_ACCOUNT: 'Conta editada com sucesso.',
};
const errorMessages = {
    INTERNAL_ERROR: 'Erro interno do servidor.',
    INVALID_EMAIL: 'Por favor, insira um endereço de e-mail válido.',
    EMPTY_INPUT: 'Nenhum parametro pode estar vazio.',
    USERNAME_IN_USE: 'Este nome de usuário já está em uso.',
    EMAIL_IN_USE: 'Este endereço de e-mail já está em uso.',
    WEAK_PASSWORD: 'A senha é muito fraca. Por favor, escolha uma senha mais forte.',
    LIMIT_PASSWORD: 'A senha não deve ter mais de 64 caracteres',
    NO_MATCH_PASSWORDS: 'As senhas não conhecidem.',
    NO_CORRECT_PASSWORDS: 'Senha atual incorreta.',
    ALTERED_PASSWORD: 'Senha alterada com sucesso.',
    NO_SPECIAL_CHARACTERS: 'A senha deve conter caracteres especiais(!@#$)',
    DELETED_ACCOUNT: 'Conta deletada com sucesso.'
};

module.exports = class ProfileController {
    static async profile(req, res) {
        // busca o usuário pelo id na url
        const id = req.params.id;
        const account = await connection.query("SELECT users.id, users.name, users.email, users.perfil, users.banner, users.biography, follows.followers, follows.following FROM users INNER JOIN follows ON users.id = follows.UserId WHERE users.id = ?", [id]);
        const session = await connection.query("SELECT id, name, email, perfil, banner, biography FROM users WHERE id = ?", [req.session.userid]);

        if (!(account[0].length > 0)) {
            return res.status(404).render("layouts/notFound");
        }
        // consulta de publicações do usuário
        const publications = await connection.query("SELECT publications.* , users.name, users.perfil FROM publications INNER JOIN users ON publications.UserId = users.id WHERE users.id = ? ORDER BY createdAt DESC", [id]);

        res.render("layouts/main", { router: "../pages/profile/profile", publications: publications[0], user: session[0][0], profile: account[0][0] });
    }
    static async edit(req, res) {
        const id = req.params.id;
        const account = await connection.query("SELECT * FROM users WHERE id = ?", [id]);

        if (!(account[0].length > 0)) {
            req.flash("msg", errorMessages.INTERNAL_ERROR);
            return res.redirect("/");
        }
        if (account[0][0].id !== req.session.userid) {
            req.flash("msg", errorMessages.INTERNAL_ERROR);
            return res.redirect("/");
        }

        res.render("layouts/main", { router: "../pages/profile/edit", user: account[0][0] });
    }
    static async makeEdit(req, res) {
        // editar perfil
        const { id, name, email, biography } = req.body;

        // validações front-end: validações sem ligação com banco de dados.

        if (itIsEmail.test(email)) {
            req.flash("msg", errorMessages.INVALID_EMAIL);
            return res.redirect(`/profile/${id}/edit`);
        }
        if (name.length === 0) {
            req.flash("msg", errorMessages.EMPTY_INPUT);
            return res.redirect(`/profile/${id}/edit`);
        }
        if (name.length === 0) {
            req.flash("msg", errorMessages.EMPTY_INPUT);
            return res.redirect(`/profile/${id}/edit`);
        }

        // validações back-end: validações com ligação com banco de dados.

        try {
            let userPerfilPath = null;
            let userBannerPath = null;

            // verifica se usuário existe
            const account = await connection.query("SELECT id, name ,email, perfil, banner FROM users WHERE id = ?", [id]);
            const nameWasInDb = await connection.query("SELECT id, name FROM users WHERE name = ?", [name]);

            if (!(account[0].length > 0) && (email !== account[0][0].email && id !== account[0][0].id)) {
                req.flash("msg", errorMessages.EMAIL_IN_USE);

                console.log("n passou pelas validação")
                return res.redirect(`/profile/${id}/edit`)
            }

            if (nameWasInDb[0].length > 0 && (name !== account[0][0].name && id !== account[0][0].id)) {
                req.flash("msg", errorMessages.USERNAME_IN_USE);

                console.log("n 1 passou pelas validação")
                return res.redirect(`/profile/${id}/edit`)
            }

            console.log("passou pelas validação")

            // caminho dos arquivos
            // perfil
            if (req.files && req.files["perfil"]) {
                userPerfilPath = req.files["perfil"][0].filename;
            } else {
                userPerfilPath = account[0][0].perfil;
            }
            // banner
            if (req.files && req.files["banner"]) {
                userBannerPath = req.files["banner"][0].filename;
            } else {
                userBannerPath = account[0][0].banner;
            }

            await connection.query("UPDATE users SET name = ?, email = ?, perfil = ?, banner = ?, biography = ?, updatedAt = NOW() WHERE id = ?", [name, email, userPerfilPath, userBannerPath, biography, id]);
            req.flash("msg", successMessages.EDITED_ACCOUNT);
            return res.redirect(`/profile/${id}`);
        } catch (error) {
            console.log(error)
            req.flash("msg", errorMessages.INTERNAL_ERROR);
            return res.redirect(`/profile/${id}/edit`);
        }
    }
    static async alterPassword(req, res) {
        const { id, oldPassoword, newPassword, confirmNewPassword } = req.body;

        // validações front-end: validações sem ligação com banco de dados.

        if (wasSpecialCharacters.test(newPassword)) {
            req.flash("msg", errorMessages.NO_SPECIAL_CHARACTERS);
            return res.redirect(`/profile/${id}/edit`)
        }
        if (newPassword.length < 8) {
            req.flash("msg", errorMessages.WEAK_PASSWORD);
            return res.redirect(`/profile/${id}/edit`)
        }
        if (newPassword.length > 64) {
            req.flash("msg", errorMessages.LIMIT_PASSWORD);
            return res.redirect(`/profile/${id}/edit`)
        }
        if (newPassword !== confirmNewPassword) {
            req.flash("msg", errorMessages.NO_MATCH_PASSWORDS);
            return res.redirect(`/profile/${id}/edit`)
        }

        // validações back-end: validações com ligação com banco de dados.

        try {
            const account = await connection.query("SELECT id, password, password FROM users WHERE id = ?", [id]);

            const passwordMatch = bcrypt.compareSync(oldPassoword, account[0][0].password);

            if (!passwordMatch) {
                req.flash("msg", errorMessages.NO_CORRECT_PASSWORDS);
                return res.redirect(`/profile/${id}/edit`)
            }

            // criptografando a senha do usuário.

            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(newPassword, salt);

            await connection.query("UPDATE users SET password = ?, updatedAt = NOW() WHERE id = ?", [hashedPassword, id]);
            req.flash("msg", successMessages.ALTERED_PASSWORD);
            return res.redirect(`/profile/${id}`);
        } catch (error) {
            console.log(error)
            req.flash("msg", errorMessages.INTERNAL_ERROR);
            return res.redirect(`/profile/${id}/edit`)
        }
    }
    static async deleteAccount(req, res) {
        const { id } = req.body;
        const session = req.session.userid;

        // validações front-end: validações sem ligação com banco de dados.

        if (id != session) {
            req.flash("msg", errorMessages.INTERNAL_ERROR);
            console.log(session)
            console.log(id)
            return res.redirect(`/profile/${id}/edit`);
        }

        // validações back-end: validações com ligação com banco de dados.

        try {
            // exclui o comentário
            await connection.query("DELETE FROM users WHERE id = ?", [id]);
            req.flash("msg", successMessages.DELETED_ACCOUNT);
            req.session.destroy();
            return res.redirect("/sign/in");
        } catch (error) {
            console.log(error)
            req.flash("msg", errorMessages.INTERNAL_ERROR);
            return res.redirect(`/profile/${id}/edit`)
        }
    }
    static async follows(req, res) {
        const { id } = req.body;
        const userId = req.session.userid;

        // Verifique se o usuário já segue o perfil
        const profileFollows = await connection.query("SELECT followers FROM follows WHERE UserId = ?", [id]);
        const userFollowing = await connection.query("SELECT following FROM follows WHERE UserId = ?", [userId]);
        let followingByProfile = JSON.parse(profileFollows[0][0].followers || "[]");
        let followingByUser = JSON.parse(userFollowing[0][0].following || "[]");

        if (followingByProfile.includes(userId)) {
            // Se já segue, deixe de seguir
            let profileId = id;
            followingByProfile = followingByProfile.filter(id => id !== userId);
            followingByUser = followingByUser.filter(id => id !== profileId);
        } else {
            // Se não segue, comece a seguir
            followingByProfile.push(userId);
            followingByUser.push(id);
        }

        try {
            // Atualize a lista de seguidores na tabela
            await connection.query("UPDATE follows SET followers = ?, updatedAt = now() WHERE UserId = ?", [JSON.stringify(followingByProfile), id]);
            await connection.query("UPDATE follows SET following = ?, updatedAt = now() WHERE UserId = ?", [JSON.stringify(followingByUser), userId]);
            return res.redirect(`/profile/${id}`)
        } catch (error) {
            console.log(error)
            req.flash("msg", errorMessages.INTERNAL_ERROR);
            return res.redirect(`/profile/${id}`)
        }
    }
}