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

    static async get(req, res) {
        try {
            const userid = req.session.userid;

            const cart = await Cart.findOne({ where: { userId: userid }, include: Users });

            if (!cart) {
                req.flash('message', 'Carrinho Vazio.')
                return res.redirect('/store')
            }

            const itemsInfo = await (async function (cart) {
                const currentItems = JSON.parse(cart.itemIds) || [];
                const itemsInfo = []

                for (const itemId of currentItems) {
                    const CollectiblesInfo = await Collectibles.findByPk(itemId);
                    itemsInfo.push(CollectiblesInfo);
                }

                return itemsInfo
            })(cart);


            const cartItemsMap = itemsInfo.map(item => item.dataValues)
            const total = itemsInfo.reduce((acc, item) => acc + parseFloat(item.dataValues.price), 0);

            res.render('store/shopping', { items: cartItemsMap, total: total });
        } catch (error) {
            console.log(error)
        }

    }

    static async addToCart(req, res) {
        try {
            const itemId = req.body.id;
            const userId = req.session.userid;

            if (!userId) {
                res.redirect('/access');
            }

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
            } else {
                req.flash('message', 'Item já adicionado ao carrinho.');
            }
            res.redirect(`/store/item/${itemId}`);

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

            res.redirect('/store/get');

        } catch (error) {
            console.log(error)
        }
    }

    static async getPass(req, res) {

        const id = req.session.userid
        const userExists = await Users.findOne({ where: { id } });

        if (!userExists) {
            req.flash('message', 'Erro ao encontrar o usuário!');
            return res.redirect('/access');
        }

        await Users.update({ pass: true }, { where: { id } })
        req.flash('message', 'Parabens! você conquistou o passe Universal.')
        res.redirect('/')

    }

};
