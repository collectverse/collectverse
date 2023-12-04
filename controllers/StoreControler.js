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

    static showPass(req, res) {
        res.render('store/pass')
    }

    static getPass(req, res) {
        res.render('store/shopping')
    }

}