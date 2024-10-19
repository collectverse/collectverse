const connection = require("../schema/connection");

async function getItem(req, res, id, price) {
    const account = await connection.query("SELECT id, points FROM users WHERE id = ?", [req.session.userid]);
    const remainder = account[0][0].points - price;

    // Verifica se o usuário tem pontos suficientes
    if (Math.sign(remainder) === -1) {
        req.flash("error", errorMessages.DONT_HAVE_POINTS);
        return res.status(401).redirect(`/store/points`);
    }

    const cart = await connection.query("SELECT id, itemIds FROM carts WHERE UserId = ?", [req.session.userid]);
    let collectables = JSON.parse(cart[0][0].itemIds || "[]");

    // Verifica se o item já está no carrinho
    if (collectables.includes(id)) {
        req.flash("error", errorMessages.CART_INCLUDE);
        return res.status(401).redirect(`/store`);
    }

    collectables.push(id);

    // Atualiza os dados do usuário e do carrinho
    await connection.query("UPDATE users SET points = ?, updatedAt = NOW() WHERE id = ?", [remainder, req.session.userid]);
    await connection.query("UPDATE carts SET itemIds = ?, updatedAt = NOW() WHERE UserId = ?", [JSON.stringify(collectables), req.session.userid]);

}

module.exports = getItem;