const connection = require("../schema/connection.js");
const successMessages = {
    SUCESS_BUY_PASS: 'Passe comprado com sucesso.',
    ALREADY_HAVE_PASS: 'Você já tem o Passe.',
    SUCESS_CHALLENGE_ACCEPTED: 'Desafio aceito com sucesso.',
    SUCESS_CHALLENGE_DELETED: 'Desafio removido com sucesso.'
};
const errorMessages = {
    NOT_SESSION: 'É necessário estar em uma conta.',
    CART_INCLUDE: 'Item já adicionado em seu inventário.',
    INTERNAL_ERROR: 'Erro interno do servidor.',
    DONT_HAVE_POINTS: 'Não há pontos o suficiente.'
};

module.exports = class MainController {
    static async store(req, res) {
        const account = await connection.query("SELECT users.id, users.name, users.email, users.perfil, users.points, users.pass, follows.followers FROM users INNER JOIN follows ON users.id = follows.UserId WHERE users.id = ?", [req.session.userid]);
        const highlights = await connection.query("SELECT users.id, users.name, users.perfil, users.banner, users.pass, follows.followers, carts.itemIds FROM users INNER JOIN follows ON users.id = follows.UserId INNER JOIN carts ON users.id = carts.UserId ORDER BY carts.itemIds ASC LIMIT 5");
        const notifications = await connection.query("SELECT * FROM notify WHERE parentId = ? ORDER BY createdAt DESC", [req.session.userid]);
        const idForPassItem = 1;
        const pass = await connection.query("SELECT pass.value, pass.shopId, shop.* FROM pass INNER JOIN shop ON shop.id = pass.shopId WHERE pass.id = ? LIMIT 1", [idForPassItem]);

        // filtro de itens
        let category = req.query.category || "";
        let shop = null;

        if (category === "all" || category === "") {
            shop = await connection.query("SELECT * FROM shop WHERE forPass != 1");
        } else if (category === "new") {
            shop = await connection.query("SELECT * FROM shop WHERE forPass != 1 ORDER BY createdAt DESC LIMIT 2");
        }

        res.status(200).render("layouts/main.ejs", { router: "../pages/store/store.ejs", user: account[0][0], highlights: highlights[0], shop: shop[0], category: category, notifications: notifications[0], pass: pass[0][0], title: "Collectverse - Loja" });
    }
    static async itemShow(req, res) {
        const id = req.params.id;

        // consulta do usuário logado
        const account = await connection.query("SELECT users.id, users.name, users.email, users.perfil, users.points, users.pass, follows.followers FROM users INNER JOIN follows ON users.id = follows.UserId WHERE users.id = ?", [req.session.userid]);

        const notifications = await connection.query("SELECT * FROM notify WHERE parentId = ? ORDER BY createdAt DESC", [req.session.userid]);

        // consulta o item
        const item = await connection.query("SELECT * FROM shop WHERE id = ?", [id]);

        // colsulta se o usuario já tem o item
        const cart = await connection.query("SELECT id, itemIds FROM carts WHERE UserId = ?", [req.session.userid]);
        let alreadyPurchased = null;
        let collectables = null;

        req.session.userid ? collectables = JSON.parse(cart[0][0].itemIds || "[]") : collectables = [];

        if (collectables.includes(id)) {
            alreadyPurchased = true
        } else {
            alreadyPurchased = false
        }

        res.status(200).render("layouts/main.ejs", { router: "../pages/store/item.ejs", user: account[0][0], item: item[0][0], alreadyPurchased: alreadyPurchased, notifications: notifications[0], title: `Collectverse - ${item[0][0].name}` });
    }
    static async getItem(req, res) {
        const { id, price } = req.body;

        if (!(req.session.userid)) {
            req.flash("error", errorMessages.NOT_SESSION);
            return res.status(401).redirect("/sign/In");
        }

        const account = await connection.query("SELECT id, points FROM users WHERE id = ?", [req.session.userid]);

        const remainder = account[0][0].points - price

        if (Math.sign(remainder) == -1) {
            req.flash("error", errorMessages.DONT_HAVE_POINTS)
            return res.status(401).redirect(`/store/points`)
        }

        const cart = await connection.query("SELECT id, itemIds FROM carts WHERE UserId = ?", [req.session.userid]);
        let collectables = JSON.parse(cart[0][0].itemIds || "[]")

        if (collectables.includes(id)) {
            req.flash("error", errorMessages.CART_INCLUDE);
            return res.status(401).redirect(`/store`)
        }

        collectables.push(id);

        try {

            // atualiza inventário
            await connection.query("UPDATE users SET points = ?, updatedAt = NOW() WHERE id = ?", [remainder, req.session.userid])
            await connection.query("UPDATE carts SET itemIds = ?, updatedAt = NOW() WHERE UserId = ?", [JSON.stringify(collectables), req.session.userid])

            return res.status(200).redirect(`/store/points`)

        } catch (error) {
            console.log(error)
            req.flash("error", errorMessages.INTERNAL_ERROR);
            return res.status(500).redirect(`/store`)
        }
    }
    static async getPass(req, res) {
        const account = await connection.query("SELECT id, points, pass FROM users WHERE id = ?", [req.session.userid]);
        const pass = await connection.query("SELECT value, shopId FROM pass LIMIT 1 ")

        if (account[0].length == 0) {
            return res.status(400).redirect("/sign/in");
        }

        if (account[0][0].pass == 1) {
            req.flash("success", successMessages.ALREADY_HAVE_PASS)
            return res.status(400).redirect("/store")
        }

        const universePrice = pass[0][0].value

        const remainder = account[0][0].points - universePrice

        if (Math.sign(remainder) == -1) {
            req.flash("error", errorMessages.DONT_HAVE_POINTS)
            return res.status(401).redirect("/store")
        }

        const cart = await connection.query("SELECT id, itemIds FROM carts WHERE UserId = ?", [req.session.userid]);
        let collectables = JSON.parse(cart[0][0].itemIds || "[]")

        const id = pass[0][0].shopId

        if (collectables.includes(id)) {
            req.flash("error", errorMessages.CART_INCLUDE);
            return res.status(401).redirect(`/store`)
        }

        collectables.push(id);

        try {
            await connection.query("UPDATE users SET points = ?, pass = ?, updatedAt = NOW() WHERE id = ?", [remainder, true, req.session.userid])
            await connection.query("UPDATE carts SET itemIds = ?, updatedAt = NOW() WHERE UserId = ?", [JSON.stringify(collectables), req.session.userid])

            req.flash("success", successMessages.SUCESS_BUY_PASS)
            return res.status(200).redirect("/store")
        } catch (error) {
            console.log(error)
            req.flash("error", errorMessages.INTERNAL_ERROR);
            return res.status(500).redirect(`/store`)
        }
    }

    static async points(req, res) {
        const account = await connection.query("SELECT users.id, users.name, users.email, users.perfil, users.points, users.pass, follows.followers FROM users INNER JOIN follows ON users.id = follows.UserId WHERE users.id = ?", [req.session.userid]);
        const notifications = await connection.query("SELECT * FROM notify WHERE parentId = ? ORDER BY createdAt DESC", [req.session.userid]);

        const challengesForUser = await connection.query("SELECT * FROM challengesForUser INNER JOIN challenges on challengesForUser.challengeId = challenges.id WHERE challengesForUser.userId = ?", [req.session.userid])

        // filtro de itens
        let category = req.query.category || "";
        let challenges = null;

        if (category === "all" || category === "") {
            challenges = await await connection.query("SELECT * FROM challenges")
        } else if (category === "new") {
            challenges = await connection.query("SELECT * FROM challenges ORDER BY createdAt DESC LIMIT 2")
        }

        res.status(200).render("layouts/main.ejs", { router: "../pages/store/points.ejs", user: account[0][0], notifications: notifications[0], challenges: challenges[0], challengesForUser: challengesForUser[0][0], title: "Collectverse - Loja" });
    }

    static async getPoints(req, res) {
        const { points } = req.body;

        try {

            const account = await connection.query("SELECT id, points FROM users WHERE id = ?", [req.session.userid])

            const newPoints = parseInt(account[0][0].points) + parseInt(points)

            await connection.query("UPDATE users SET points = ?, updatedAt = now() WHERE id = ?", [newPoints, req.session.userid])

            res.status(200).redirect("/store")
        } catch (error) {
            console.log(error)
            req.flash("error", errorMessages.INTERNAL_ERROR);
            return res.status(500).redirect(`/store`)
        }
    }

    static async startChallenge(req, res) {
        const { challengeId } = req.body;

        try {
            await connection.query("DELETE FROM challengesForUser WHERE userId = ?", [req.session.userid])
            await connection.query("INSERT INTO challengesForUser(userId, challengeId, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())", [req.session.userid, challengeId]);

            req.flash("success", successMessages.SUCESS_CHALLENGE_ACCEPTED)
            return res.status(200).redirect("/store/points")
        } catch (error) {
            console.log(error)
            req.flash("error", errorMessages.INTERNAL_ERROR);
            return res.status(500).redirect(`/store/points`)
        }
    }

    static async declineChallenge(req, res) {
        try {
            await connection.query("DELETE FROM challengesForUser WHERE userId = ?", [req.session.userid])
            req.flash("success", successMessages.SUCESS_CHALLENGE_DELETED)
            return res.status(200).redirect("/store/points")
        } catch (error) {
            console.log(error)
            req.flash("error", errorMessages.INTERNAL_ERROR);
            return res.status(500).redirect(`/store/points`)
        }
    }
}