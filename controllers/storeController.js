const connection = require("../schema/connection.js");

module.exports = class MainController {
    static async store(req, res) {
        // consulta do usuário logado
        const account = await connection.query("SELECT users.id, users.name, users.email, users.perfil, follows.followers FROM users INNER JOIN follows ON users.id = follows.UserId WHERE users.id = ?", [req.session.userid]);
        
        // destaques
        const highlights = await connection.query("SELECT users.id, users.name, users.perfil, users.banner, follows.followers FROM users INNER JOIN follows ON users.id = follows.UserId LIMIT 5");

        // filtro de itens

        let category = "";

        if(req.query.category) {
            category = req.query.category;
        }

        const shop = await connection.query("SELECT * FROM shop")

        res.render("layouts/main.ejs", {router: "../pages/store/store.ejs", user: account[0][0], highlights: highlights[0], shop: shop[0], category: category })
    }
}