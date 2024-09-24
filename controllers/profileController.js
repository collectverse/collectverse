const connection = require("../schema/connection.js");
const bcrypt = require("bcryptjs");
const returnFollowersAndFollowing = require("../helpers/followingAndFollowersreturn.js");

const ChallengeHelpers = require("../helpers/challenges.js")

const successMessages = {
    EDITED_ACCOUNT: 'Conta editada com sucesso.',
    DELETED_ACCOUNT: 'Conta deletada com sucesso.'
};

const errorMessages = {
    NOT_SESSION: 'É necessário estar logado.',
    INTERNAL_ERROR: 'Erro interno do servidor.',
    INVALID_EMAIL: 'Por favor, insira um endereço de e-mail válido.',
    EMPTY_INPUT: 'Nenhum parâmetro pode estar vazio.',
    USERNAME_IN_USE: 'Este nome de usuário já está em uso.',
    EMAIL_IN_USE: 'Este endereço de e-mail já está em uso.',
    WEAK_PASSWORD: 'A senha é muito fraca. Por favor, escolha uma senha mais forte.',
    LIMIT_PASSWORD: 'A senha não deve ter mais de 64 caracteres.',
    NO_MATCH_PASSWORDS: 'As senhas não coincidem.',
    NO_CORRECT_PASSWORDS: 'Senha atual incorreta.',
    ALTERED_PASSWORD: 'Senha alterada com sucesso.',
    NO_SPECIAL_CHARACTERS: 'A senha deve incluir letras maiúsculas, minúsculas, números e caracteres especiais.',
    NOT_FOUND: 'Não encontrado.'
};

const itIsEmail = /S+@S+.S+/;
const wasSpecialCharacters = /[^a-zA-Z0-9]/;

module.exports = class ProfileController {
    static async profile(req, res) {
        try {
            // busca o usuário pelo id na url
            const id = req.params.id;
            const [account, session] = await Promise.all([
                connection.query(`SELECT users.id, users.name, users.email, users.perfil, users.perfilBase64, users.banner, users.bannerBase64, users.biography, users.collectible, users.pass, follows.followers, follows.following, carts.itemIds FROM users INNER JOIN follows ON users.id = follows.UserId INNER JOIN carts ON users.id = carts.UserId WHERE users.id = ?`, [id]),
                connection.query("SELECT id, name, email, perfil, perfilBase64, banner, bannerBase64, points, pass, biography FROM users WHERE id = ?", [req.session.userid])
            ]);

            const notifications = await connection.query("SELECT * FROM notify WHERE parentId = ? ORDER BY createdAt DESC", [req.session.userid]);

            const cart = JSON.parse(account[0][0].itemIds || "[]");
            const inventory = await Promise.all(cart.map(async (itemId) => {
                const [item] = await connection.query("SELECT * FROM shop WHERE id = ?", [itemId]);
                return item[0];
            }));

            if (account[0].length == 0) {
                req.flash("error", errorMessages.NOT_FOUND);
                return res.status(404).redirect("/");
            }
            // consulta de publicações do usuário
            const publications = await connection.query("SELECT publications.* , users.name, users.perfil, users.perfilBase64 FROM publications INNER JOIN users ON publications.UserId = users.id WHERE users.id = ? ORDER BY createdAt DESC", [id]);

            // retorna modal de seguidores e seguindo
            const { resultForFollowers, resultForFollowing } = await returnFollowersAndFollowing(id);

            res.status(200).render("layouts/main.ejs", { router: "../pages/profile/profile.ejs", publications: publications[0], user: session[0][0], profile: account[0][0], inventory: inventory, followers: resultForFollowers, following: resultForFollowing, notifications: notifications[0], title: `Collectverse - ${account[0][0].name}` });

        } catch (error) {
            console.log(error)
            req.flash("error", errorMessages.INTERNAL_ERROR);
            return res.status(500).redirect("/");
        }
    }
    static async edit(req, res) {
        try {
            const id = req.params.id;
            const account = await connection.query("SELECT * FROM users WHERE id = ?", [id]);

            const notifications = await connection.query("SELECT * FROM notify WHERE parentId = ? ORDER BY createdAt DESC", [req.session.userid]);

            if (!(account[0].length > 0)) {
                req.flash("error", errorMessages.INTERNAL_ERROR);
                return res.status(401).redirect("/");
            }
            if (account[0][0].id !== req.session.userid) {
                req.flash("error", errorMessages.INTERNAL_ERROR);
                return res.status(401).redirect("/");
            }

            res.status(200).render("layouts/main.ejs", { router: "../pages/profile/edit.ejs", user: account[0][0], notifications: notifications[0], title: "Collectverse - Editar perfil" });
        } catch (error) {
            console.log(error)
            req.flash("error", errorMessages.INTERNAL_ERROR);
            return res.status(500).redirect("/");
        }
    }
    static async makeEdit(req, res) {
        try {
            // editar perfil
            const { id, name, email, biography } = req.body;

            if (itIsEmail.test(email)) {
                req.flash("error", errorMessages.INVALID_EMAIL);
                return res.status(400).redirect(`/profile/${id}/edit`);
            }
            if (name.length === 0) {
                req.flash("error", errorMessages.EMPTY_INPUT);
                return res.status(400).redirect(`/profile/${id}/edit`);
            }

            // verifica se usuário existe
            const [account, nameWasInDb] = await Promise.all([
                connection.query("SELECT id, name, email, perfil, perfilBase64, banner, bannerBase64 FROM users WHERE id = ?", [id]),
                connection.query("SELECT id, name FROM users WHERE name = ?", [name])
            ]);

            if (!(account[0].length > 0) && (email !== account[0][0].email && id !== account[0][0].id)) {
                req.flash("error", errorMessages.EMAIL_IN_USE);
                return res.status(400).redirect(`/profile/${id}/edit`);
            }

            if (nameWasInDb[0].length > 0 && (name !== account[0][0].name && id !== account[0][0].id)) {
                req.flash("error", errorMessages.USERNAME_IN_USE);
                return res.status(400).redirect(`/profile/${id}/edit`);
            }
            // caminho dos arquivos

            // let userPerfilPath = null;
            // let userBannerPath = null;
            // perfil
            // if (req.files && req.files["perfil"]) {
            //     userPerfilPath = req.files["perfil"][0].filename;
            //     // ChallengeHelpers.redeemChallenge(req, res, next, req.session.userId, 5)
            // } else {
            //     userPerfilPath = account[0][0].perfil;
            // }
            // // banner
            // if (req.files && req.files["banner"]) {
            //     userBannerPath = req.files["banner"][0].filename;
            // } else {
            //     userBannerPath = account[0][0].banner;
            // }

            let userPerfilImageBase64 = null;
            let userBannerImageBase64 = null;
            if (req.files && req.files["perfil"]) {
                // `req.files["image"]` é um array de arquivos
                req.files["perfil"].forEach(file => {
                    userPerfilImageBase64 = file.buffer.toString('base64');
                });
                // desafio

                const challengeForUser = await connection.query("SELECT * FROM challengesForUser WHERE userId = ?", [req.session.userid]);

                if (challengeForUser[0][0] != undefined) {
                    if (challengeForUser && challengeForUser[0][0].challengeId && challengeForUser[0][0].challengeId == 5) {
                        ChallengeHelpers.redeemChallenge(req, res, req.session.userid, challengeForUser[0][0].challengeId);
                    }
                }
            } else {
                userPerfilImageBase64 = account[0][0].perfilBase64;
            }

            if (req.files && req.files["banner"]) {
                // `req.files["image"]` é um array de arquivos
                req.files["banner"].forEach(file => {
                    userBannerImageBase64 = file.buffer.toString('base64');
                });
            } else {
                userBannerImageBase64 = account[0][0].bannerBase64;
            }

            await connection.query("UPDATE users SET name = ?, email = ?, perfil = ? , perfilBase64 = ?, banner = ?, bannerBase64 = ?, biography = ?, updatedAt = NOW() WHERE id = ?", [name, email, null, userPerfilImageBase64, null, userBannerImageBase64, biography, id]);
            req.flash("success", successMessages.EDITED_ACCOUNT);
            return res.status(200).redirect(`/profile/${id}`);

        } catch (error) {
            console.log(error)
            req.flash("error", errorMessages.INTERNAL_ERROR);
            return res.status(500).redirect(`/profile/${req.session.userid}/edit`);
        }
    }
    static async alterPassword(req, res) {
        try {
            const { id, oldPassoword, newPassword, confirmNewPassword } = req.body;

            // Verifica se a senha não possui caracteres especiais
            if (!wasSpecialCharacters.test(newPassword)) {
                req.flash("error", errorMessages.NO_SPECIAL_CHARACTERS);
                return res.status(400).redirect(`/profile/${id}/edit`)
            }

            if (newPassword.length < 6) {
                req.flash("error", errorMessages.WEAK_PASSWORD);
                return res.status(400).redirect(`/profile/${id}/edit`)
            }
            if (newPassword.length > 64) {
                req.flash("error", errorMessages.LIMIT_PASSWORD);
                return res.status(400).redirect(`/profile/${id}/edit`)
            }
            if (newPassword !== confirmNewPassword) {
                req.flash("error", errorMessages.NO_MATCH_PASSWORDS);
                return res.status(400).redirect(`/profile/${id}/edit`)
            }

            const account = await connection.query("SELECT id, password, password FROM users WHERE id = ?", [id]);

            const passwordMatch = bcrypt.compareSync(oldPassoword, account[0][0].password);

            if (!passwordMatch) {
                req.flash("error", errorMessages.NO_CORRECT_PASSWORDS);
                return res.status(400).redirect(`/profile/${id}/edit`)
            }

            // criptografando a senha do usuário.

            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(newPassword, salt);

            await connection.query("UPDATE users SET password = ?, updatedAt = NOW() WHERE id = ?", [hashedPassword, id]);
            req.flash("success", successMessages.ALTERED_PASSWORD);
            return res.status(200).redirect(`/profile/${id}`);

        } catch (error) {
            console.log(error)
            req.flash("error", errorMessages.INTERNAL_ERROR);
            return res.status(500).redirect(`/profile/${req.session.userid}/edit`)
        }
    }
    static async deleteAccount(req, res) {
        try {
            const id = req.body.id;

            if (id != req.session.userid) {
                req.flash("error", errorMessages.INTERNAL_ERROR);
                return res.status(401).redirect(`/profile/${id}/edit`);
            }

            // exclui o comentário
            await connection.query("DELETE FROM carts WHERE userId = ?", [id]);
            await connection.query("DELETE FROM publications WHERE userId = ?", [id]);
            await connection.query("DELETE FROM follows WHERE userId = ?", [id]);
            await connection.query("DELETE FROM challengesForUser WHERE userId = ?", [id]);
            await connection.query("DELETE FROM notify WHERE userId = ?", [id]);
            await connection.query("DELETE FROM users WHERE id = ?", [id]);
            req.flash("success", successMessages.DELETED_ACCOUNT);
            req.session.destroy(() => {
                return res.status(200).redirect("/sign/in");
            });
        } catch (error) {
            console.log(error)
            req.flash("error", errorMessages.INTERNAL_ERROR);
            return res.status(500).redirect(`/profile/${req.session.userid}/edit`)
        }
    }
    static async follows(req, res) {
        try {
            const id = req.body.id;

            if (!(req.session.userid)) {
                req.flash("error", errorMessages.NOT_SESSION);
                return res.status(401).redirect("/sign/In");
            }

            // Verifique se o usuário já segue o perfil
            const profileFollows = await connection.query("SELECT followers FROM follows WHERE UserId = ?", [id]);
            const profile = await connection.query("SELECT id, name FROM users WHERE id = ?", [req.session.userid])
            const userFollowing = await connection.query("SELECT following FROM follows WHERE UserId = ?", [req.session.userid]);
            let followingByProfile = JSON.parse(profileFollows[0][0].followers || "[]");
            let followingByUser = JSON.parse(userFollowing[0][0].following || "[]");

            if (followingByProfile.includes(req.session.userid)) {
                // Se já segue, deixe de seguir
                let profileId = id;
                followingByProfile = followingByProfile.filter(id => id !== req.session.userid);
                followingByUser = followingByUser.filter(id => id !== profileId);
            } else {
                // Se não segue, comece a seguir

                followingByProfile.push(req.session.userid);
                followingByUser.push(id);

                const content = `${profile[0][0].name} Começou a seguir você.`
                await connection.query("INSERT INTO notify (UserId, parentId, type, content, createdAt, updatedAt) VALUES (?, ?, ?, ?, NOW(), NOW())", [req.session.userid, id, "follow", content]);

                // desafio

                const challengeForUser = await connection.query("SELECT * FROM challengesForUser WHERE userId = ?", [req.session.userid]);


                if (challengeForUser[0][0] != undefined) {
                    if (challengeForUser && challengeForUser[0][0].challengeId && challengeForUser[0][0].challengeId == 1) {
                        ChallengeHelpers.redeemChallenge(req, res, req.session.userid, challengeForUser[0][0].challengeId);
                    }
                }
            }

            // Atualize a lista de seguidores na tabela
            await connection.query("UPDATE follows SET followers = ?, updatedAt = now() WHERE UserId = ?", [JSON.stringify(followingByProfile), id]);
            await connection.query("UPDATE follows SET following = ?, updatedAt = now() WHERE UserId = ?", [JSON.stringify(followingByUser), req.session.userid]);
            return res.status(200).redirect(`/profile/${id}`)
        } catch (error) {
            console.log(error)
            req.flash("error", errorMessages.INTERNAL_ERROR);
            return res.status(500).redirect("/")
        }
    }
    static async toggleModel(req, res) {
        try {
            const id = req.body.id;

            const model = await connection.query("SELECT path FROM shop WHERE id = ?", [id]);
            await connection.query("UPDATE users SET collectible = ?, updatedAt = NOW() WHERE id = ?", [model[0][0].path, req.session.userid])

            res.status(200).redirect(`/profile/${req.session.userid}`);
        } catch (error) {
            console.log(error)
            req.flash("error", errorMessages.INTERNAL_ERROR);
            return res.status(500).redirect(`/profile/${req.session.userid}`)
        }
    }
    static async nullModel(req, res) {
        try {
            await connection.query("UPDATE users SET collectible = ?, updatedAt = NOW() WHERE id = ?", [null, req.session.userid])

            res.status(200).redirect(`/profile/${req.session.userid}`);
        } catch (error) {
            console.log(error)
            req.flash("error", errorMessages.INTERNAL_ERROR);
            return res.status(500).redirect(`/profile/${req.session.userid}`)
        }
    }
}