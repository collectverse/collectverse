const Cart = require('../models/cart');
const Collectibles = require('../models/Collectibles');
const Users = require('../models/Users');

module.exports = class ItemsController {

    static async showStore(req, res) {

        try {
            const allItems = await Collectibles.findAll()

            const mapAllItems = allItems.map((item) => {
                const itemData = item.dataValues;
                return itemData;
            });

            res.render('store/store', { item: mapAllItems })
        } catch (error) {
            console.log(error)
        }
    }

    static async showitem(req, res) {
        try {
            const id = req.params.id;

            const item = await Collectibles.findOne({ where: { id: id } });

            if (!item) {
                return res.status(404).render('statics/err');
            }

            res.render('store/item', { item: item.dataValues })
        } catch (error) {
            console.log(error)
        }
    }

    static showPass(req, res) {
        res.render('store/pass')
    }

    static getPass(req, res) {
        res.render('store/shopping')
    }

    static async addToCart(req, res) {

        try {
            const itemId = req.body.id;
            const userId = req.session.userid;

            // check for user as cart
            const user = await Users.findByPk(userId, { include: Cart })
            const cart = user.Cart;

            if (cart) {
                // user as cart
                const currentItems = JSON.parse(cart.itemIds) || [];
                cart.itemIds = JSON.stringify([...currentItems, itemId]);
                await cart.save();
            } else {
                const newCart = await Cart.create({ itemIds: JSON.stringify([itemId]) });
                await user.setCart(newCart);
            }

            req.flash('message', 'Item adicionado ao carrinho.');
            res.redirect(`/store/item/${itemId}`);

        } catch (error) {
            req.flash('error', 'Erro ao adicionar item ao carrinho.');
            res.redirect(`/store/item/${itemId}`);
            console.log(error)
        }

    }

}