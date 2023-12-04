const Collectibles = require('../models/Collectibles')

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

}