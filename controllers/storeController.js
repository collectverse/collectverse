require('dotenv').config();

const connection = require("../schema/connection.js");
const getItem = require("../helpers/getItem.js")

//  mercado pago
const { MercadoPagoConfig, Preference } = require('mercadopago');

const client = new MercadoPagoConfig({
    accessToken: process.env.ACCESS_TOKEN_SANDBOX,
    options: { timeout: 5000, idempotencyKey: 'abc' }
});
const preference = new Preference(client);


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
    DONT_HAVE_POINTS: 'Não há Tokens o suficiente.'
};

module.exports = class StoreController {
    static async store(req, res) {
        const account = await connection.query("SELECT users.id, users.name, users.email, users.perfil, users.perfilBase64, users.points, users.pass, follows.followers FROM users INNER JOIN follows ON users.id = follows.UserId WHERE users.id = ?", [req.session.userid]);
        const highlights = await connection.query("SELECT users.id, users.name, users.perfil, users.perfilBase64, users.banner, users.bannerBase64, users.pass, follows.followers, carts.itemIds FROM users INNER JOIN follows ON users.id = follows.UserId INNER JOIN carts ON users.id = carts.UserId ORDER BY carts.itemIds ASC LIMIT 5");
        const notifications = await connection.query("SELECT * FROM notify WHERE parentId = ? ORDER BY createdAt DESC", [req.session.userid]);
        const idForPassItem = 1;
        const pass = await connection.query("SELECT pass.value, pass.shopId, shop.* FROM pass INNER JOIN shop ON shop.id = pass.shopId WHERE pass.id = ? LIMIT 1", [idForPassItem]);

        // filtro de itens
        let category = req.query.category || "";
        let shop = null;

        const itemForPass = pass[0][0].shopId;
        console.log(itemForPass)

        if (category === "all" || category === "") {
            shop = await connection.query("SELECT * FROM shop WHERE id != ?", [itemForPass]);
        } else if (category === "new") {
            shop = await connection.query("SELECT * FROM shop WHERE id != ? ORDER BY createdAt DESC LIMIT 2", [itemForPass]);
        }

        res.status(200).render("layouts/main.ejs", { router: "../pages/store/store.ejs", user: account[0][0], highlights: highlights[0], shop: shop[0], category: category, notifications: notifications[0], pass: pass[0][0], title: "Collectverse - Loja" });
    }
    static async itemShow(req, res) {
        const id = req.params.id;

        // consulta do usuário logado
        const account = await connection.query("SELECT users.id, users.name, users.email, users.perfil, users.perfilBase64, users.points, users.pass, follows.followers FROM users INNER JOIN follows ON users.id = follows.UserId WHERE users.id = ?", [req.session.userid]);

        const notifications = await connection.query("SELECT * FROM notify WHERE parentId = ? ORDER BY createdAt DESC", [req.session.userid]);

        // consulta o item
        const item = await connection.query("SELECT * FROM shop WHERE id = ?", [id]);

        const pass = await connection.query("SELECT shopId FROM pass LIMIT 1");

        let itemIsInPass = false;

        if (id == pass[0][0].shopId) {
            itemIsInPass = true;
        }

        console.log(itemIsInPass)

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

        res.status(200).render("layouts/main.ejs", { router: "../pages/store/item.ejs", user: account[0][0], item: item[0][0], alreadyPurchased: alreadyPurchased, notifications: notifications[0], title: `Collectverse - ${item[0][0].name}`, itemIsInPass: itemIsInPass });
    }

    static async getItem(req, res) {
        const { id, price } = req.body;

        // Verifica se o usuário está autenticado
        if (!req.session.userid) {
            req.flash("error", errorMessages.NOT_SESSION);
            return res.status(401).redirect("/sign/In");
        }

        try {

            await getItem(req, res, id, price)
            return res.status(200).redirect(`/store/shopping/${id}`);

        } catch (error) {
            console.log(error);
            req.flash("error", errorMessages.INTERNAL_ERROR);
            return res.status(500).redirect(`/store`);
        }
    }

    static async getPass(req, res) {
        try {
            const account = await connection.query("SELECT id, points, pass FROM users WHERE id = ?", [req.session.userid]);
            const pass = await connection.query("SELECT value, shopId FROM pass LIMIT 1");

            // Verifica se a conta existe
            if (account[0].length === 0) {
                return res.status(400).redirect("/sign/in");
            }

            // Verifica se o usuário já possui o passe
            if (account[0][0].pass === 1) {
                req.flash("success", successMessages.ALREADY_HAVE_PASS);
                return res.status(400).redirect("/store");
            }

            const universePrice = pass[0][0].value;
            const remainder = account[0][0].points - universePrice;

            // Verifica se o usuário tem pontos suficientes para o passe
            if (Math.sign(remainder) === -1) {
                req.flash("error", errorMessages.DONT_HAVE_POINTS);
                return res.status(401).redirect("/store/points");
            }

            const id = pass[0][0].shopId;
            const collectables = await connection.query("SELECT * FROM shop WHERE id = ?", [id]);

            // Dados para passar para a função getItem
            const values = {
                id: String(collectables[0][0].id),
                price: 0 // Define o preço como zero para o passe
            };

            // Chama a função getItem com os dados especificados
            await getItem(req, res, values.id, values.price)

            // Atualiza o passe do usuário
            await connection.query("UPDATE users SET points = ?, pass = ?, updatedAt = NOW() WHERE id = ?", [remainder, true, req.session.userid]);

            req.flash("success", successMessages.SUCESS_BUY_PASS);
            return res.status(200).redirect("/store");
        } catch (error) {
            console.log(error);
            req.flash("error", errorMessages.INTERNAL_ERROR);
            return res.status(500).redirect(`/store`);
        }
    }

    static async points(req, res) {
        const account = await connection.query("SELECT users.id, users.name, users.email, users.perfil, users.perfilBase64, users.points, users.pass, follows.followers FROM users INNER JOIN follows ON users.id = follows.UserId WHERE users.id = ?", [req.session.userid]);
        const notifications = await connection.query("SELECT * FROM notify WHERE parentId = ? ORDER BY createdAt DESC", [req.session.userid]);

        const challengesForUser = await connection.query("SELECT * FROM challengesForUser INNER JOIN challenges on challengesForUser.challengeId = challenges.id WHERE challengesForUser.userId = ?", [req.session.userid])
        const tokens = await connection.query("SELECT * FROM tokens")

        // filtro de itens
        let category = req.query.category || "";
        let challenges = null;

        if (category === "all" || category === "") {
            challenges = await await connection.query("SELECT * FROM challenges")
        } else if (category === "new") {
            challenges = await connection.query("SELECT * FROM challenges ORDER BY createdAt DESC LIMIT 2")
        }

        // retorno para pagamento
        const params = new URLSearchParams(req.query);

        if (params.has('success')) {
            // Lógica para quando a ação foi bem-sucedida
            res.send('Ação bem-sucedida!');
        } else if (params.has('failure')) {
            // Lógica para quando a ação falhou
            res.send('Ação falhou. Tente novamente.');
        } else if (params.has('pending')) {
            // Lógica para quando a ação está pendente
            res.send('Ação está pendente. Aguarde.');
        }

        res.status(200).render("layouts/main.ejs", { router: "../pages/store/points.ejs", user: account[0][0], notifications: notifications[0], challenges: challenges[0], challengesForUser: challengesForUser[0][0], tokens: tokens[0], title: "Collectverse - Loja" });
    }

    static async getPoints(req, res) {
        const { n } = req.params;

        try {

            if (!req.session.userid) {
                req.flash("error", errorMessages.NOT_SESSION);
                return res.status(401).redirect("/sign/In");
            }

            const account = await connection.query("SELECT id, points FROM users WHERE id = ?", [req.session.userid])

            const newPoints = parseInt(account[0][0].points) + parseInt(n)

            await connection.query("UPDATE users SET points = ?, updatedAt = now() WHERE id = ?", [newPoints, req.session.userid])

            req.flash("sucess", `Foram adicionados ${n} a sua conta.`);
            res.status(200).redirect("/store/points")
        } catch (error) {
            console.log(error)
            req.flash("error", errorMessages.INTERNAL_ERROR);
            return res.status(500).redirect(`/store/points`)
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

    static async redeemChallenge(req, res) {
        const [account] = await connection.query("SELECT id, points FROM users WHERE id = ?", [req.session.userid]);
        const challengeForUser = await connection.query("SELECT * FROM challengesForUser WHERE userId = ?", [req.session.userid]);
        const [task] = await connection.query(
            "SELECT id, points FROM challenges WHERE id = ?",
            [challengeForUser[0][0].challengeId]
        );
        const newPoints = parseInt(account[0].points) + parseInt(task[0].points);

        await connection.query("UPDATE users SET points = ?, updatedAt = NOW() WHERE id = ?", [newPoints, req.session.userid]);
        await connection.query("DELETE FROM challengesForUser WHERE userId = ? AND challengeId = ?", [req.session.userid, challengeForUser[0][0].challengeId]);

        req.flash("success", "Desafio concluído! Tokens adicionados.");
        res.status(200).redirect("/store/points")
    }

    static async pointsShow(req, res) {
        const id = req.params.id;

        const token = await connection.query("SELECT * FROM tokens WHERE id = ?", [id])
        const account = await connection.query("SELECT users.id, users.name, users.email, users.perfil, users.perfilBase64, users.points, users.pass, follows.followers FROM users INNER JOIN follows ON users.id = follows.UserId WHERE users.id = ?", [req.session.userid]);
        const notifications = await connection.query("SELECT * FROM notify WHERE parentId = ? ORDER BY createdAt DESC", [req.session.userid]);

        res.status(200).render("layouts/main.ejs", { router: "../pages/store/getPoints.ejs", user: account[0][0], notifications: notifications[0], token: token[0][0], title: "Collectverse - Tokens" });
    }

    static async makePayment(req, res) {
        const { id, title, description, price } = req.body;
        const baseUrl = req.protocol + '://' + req.get('host');
        const body = {
            items: [
                {
                    id: String(id),
                    title: title,
                    description: description,
                    quantity: 1,
                    currency_id: 'BRL',
                    unit_price: parseInt(price)
                },
            ],
            back_urls: {
                success: `${baseUrl}/store/points?success`,
                failure: `${baseUrl}/store/points?failure`,
                pending: `${baseUrl}/store/points?failure`,
            },
            auto_return: 'all'
        }

        preference.create({ body })
            .then(response => {
                const initPoint = response.init_point;
                console.log(initPoint);
                res.status(200).redirect(initPoint)
            })
            .catch(error => {
                console.log(error)
                req.flash("error", errorMessages.INTERNAL_ERROR);
                return res.status(500).redirect(`/store/points`)
            });
    }
}