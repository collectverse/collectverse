module.exports = class ItemsController {

    static showStore(req, res) {
        res.render('store/store')
    }

    static showPass(req, res) {
        res.render('store/pass')
    }

    static getPass(req, res) {
        res.render('store/shopping')
    }

}