module.exports = class StaticsController {

    static terms(req, res) {
        res.render('statics/terms')
    }

    static lading(req, res) {
        res.render('statics/lading')
    }

}