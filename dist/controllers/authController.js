"use strict";
const Auth = require('../models/Auth');
async function register(req, res) {
    const data = await Auth.register(req.body || {});
    return res.json({ statusCode: 200, message: 'Operation successful', data });
}
async function login(req, res) {
    const data = await Auth.login(req.body || {});
    return res.json({ statusCode: 200, message: 'Operation successful', data });
}
module.exports = { register, login };
//# sourceMappingURL=authController.js.map