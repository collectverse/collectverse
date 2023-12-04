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

            // Verificar se o usuário existe
            const user = await Users.findByPk(userId, { include: Cart });

            if (!user) {
                req.flash('message', 'Usuário não encontrado.');
                return res.redirect('/store');
            }

            // Verificar se há um carrinho associado ao usuário
            let cart = user.Cart;

            if (!cart) {
                // Se não houver, criar um novo carrinho
                cart = await Cart.create({ itemIds: '[]' }); // ou use o formato que preferir
                await user.setCart(cart);
            }

            const currentItems = new Set(JSON.parse(cart.itemIds) || []);

            if (!currentItems.has(itemId)) {
                // Se o item não estiver no conjunto, adicione-o
                cart.itemIds = JSON.stringify([...currentItems, itemId]);
                await cart.save();
                req.flash('message', 'Item adicionado ao carrinho.');
            } else {
                req.flash('message', 'Item já está no carrinho.');
            }

            res.redirect(`/store/item/${itemId}`);
        } catch (error) {
            console.log(error);
            req.flash('message', 'Ocorreu um erro ao adicionar o item ao carrinho.');
            res.redirect('/store');
        }
    }

};
