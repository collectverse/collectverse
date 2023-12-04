const Cart = require('../models/cart');
const Collectibles = require('../models/Collectibles');
const Users = require('../models/Users');

module.exports = class ItemsController {

    static async showStore(req, res) {
        try {
            const allItems = await Collectibles.findAll();
            const mapAllItems = allItems.map((item) => item.dataValues);
            res.render('store/store', { item: mapAllItems });
        } catch (error) {
            console.log(error);
        }
    }

    static async showitem(req, res) {
        try {
            const id = req.params.id;
            const item = await Collectibles.findOne({ where: { id } });

            if (!item) {
                return res.status(404).render('statics/err');
            }

            res.render('store/item', { item: item.dataValues });
        } catch (error) {
            console.log(error);
        }
    }

    static showPass(req, res) {
        res.render('store/pass');
    }

    static getPass(req, res) {
        res.render('store/shopping');
    }

    static async addToCart(req, res) {
        try {
            const itemId = req.body.id;
            const userId = req.session.userid;

            const user = await Users.findByPk(userId, { include: Cart });
            let cart = user.Cart;

            if (!cart) {
                cart = await Cart.create({ itemIds: '[]' });
                await user.setCart(cart);
            }

            const currentItems = new Set(JSON.parse(cart.itemIds) || []);

            if (!currentItems.has(itemId)) {
                cart.itemIds = JSON.stringify([...currentItems, itemId]);
                await cart.save();
                req.flash('message', 'Item adicionado ao carrinho.');
                res.redirect(`/store/item/${itemId}`);
            } else {
                req.flash('message', 'Item já adicionado ao carrinho.');
                res.redirect(`/store/item/${itemId}`);
                return
            }

        } catch (error) {
            console.log(error);
        }
    }

    static async removeToCart(req, res) {
        try {
            const itemId = req.body.id;
            const userId = req.session.userid;

            const user = await Users.findByPk(userId, { include: Cart });

            if (!user) {
                req.flash('message', 'Usuário não encontrado.');
                return res.redirect('/store');
            }

            const cart = user.Cart;

            if (!cart) {
                // Se não houver, criar um novo carrinho
                cart = await Cart.create({ itemIds: '[]' });
                await user.setCart(cart);
            }

            const currentItems = new Set(JSON.parse(cart.itemIds) || []);

            if (currentItems.has(itemId)) {

                currentItems.delete(itemId);

                cart.itemIds = JSON.stringify([...currentItems]);
                await cart.save();

                req.flash('message', 'Item removido do carrinho.');
            } else {
                req.flash('message', 'Item não encontrado no carrinho.');
                return
            }

            res.redirect('/store');

        } catch (error) {
            console.log(error)
        }
    }

};
