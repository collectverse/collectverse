const Publications = require('../models/Publications');
const Users = require('../models/Users');

module.exports = class publicationsController {

    static async showHome(req, res) {

        res.render('publications/home')

    }

}