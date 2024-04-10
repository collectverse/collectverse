const connection = require("../schema/connection.js");
const errorMessages = {
    NOT_SESSION: 'É necessário estár em uma conta.',
    CART_INCLUDE: 'Item já adicionado em seu inventário.',
    INTERNAL_ERROR: 'Erro interno do servidor.',
}

module.exports = class MainController {
    static async store(req, res) {
        // consulta do usuário logado
        const account = await connection.query("SELECT users.id, users.name, users.email, users.perfil, follows.followers FROM users INNER JOIN follows ON users.id = follows.UserId WHERE users.id = ?", [req.session.userid]);

        // destaques
        const highlights = await connection.query("SELECT users.id, users.name, users.perfil, users.banner, follows.followers, carts.itemIds FROM users INNER JOIN follows ON users.id = follows.UserId INNER JOIN carts ON users.id = carts.UserId ORDER BY carts.itemIds ASC LIMIT 5");

        // filtro de itens

        let category = "";

        if (req.query.category) {
            category = req.query.category;
        }

        const shop = await connection.query("SELECT * FROM shop")

        res.render("layouts/main.ejs", { router: "../pages/store/store.ejs", user: account[0][0], highlights: highlights[0], shop: shop[0], category: category });
    }
    static async itemShow(req, res) {
        const id = req.params.id;
        const session = req.session.userid;

        // consulta do usuário logado
        const account = await connection.query("SELECT users.id, users.name, users.email, users.perfil, follows.followers FROM users INNER JOIN follows ON users.id = follows.UserId WHERE users.id = ?", [session]);

        // consulta o item
        const item = await connection.query("SELECT * FROM shop WHERE id = ?", [id]);

        // colsulta se o usuario já tem o item
        const cart = await connection.query("SELECT id, itemIds FROM carts WHERE UserId = ?", [session]);
        let alreadyPurchased = null;
        let collectables = null;

        session ? collectables = JSON.parse(cart[0][0].itemIds || "[]") : collectables = [];

        if (collectables.includes(id)) {
            alreadyPurchased = true
        } else {
            alreadyPurchased = false
        }

        res.render("layouts/main.ejs", { router: "../pages/store/item.ejs", user: account[0][0], item: item[0][0], alreadyPurchased: alreadyPurchased  });
    }
    static async getItem(req, res) {
        const id = req.body.id;
        const session = req.session.userid;

        if (!(req.session.userid)) {
            req.flash("msg", errorMessages.NOT_SESSION);
            return res.redirect("/sign/In");
        }

        const cart = await connection.query("SELECT id, itemIds FROM carts WHERE UserId = ?", [session]);
        let collectables = JSON.parse(cart[0][0].itemIds || "[]")


        if (collectables.includes(id)) {
            req.flash("msg", errorMessages.CART_INCLUDE);
            return res.redirect(`/store`)
        }

        collectables.push(id);

        try {

            // atualiza inventário
            await connection.query("UPDATE carts SET itemIds = ?, updatedAt = NOW() WHERE UserId = ?", [JSON.stringify(collectables), session])

            return res.redirect(`/store/shopping/${id}`)

        } catch (error) {
            console.log(error)
            req.flash("msg", errorMessages.INTERNAL_ERROR);
            return res.redirect(`/store`)
        }
    }

}