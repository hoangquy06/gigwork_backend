"use strict";
const Auth = require('../models/Auth');
const Verification = require('../models/Verification');
async function register(req, res) {
    const data = await Auth.register(req.body || {});
    return res.status(201).location('/api/users/me').json(data);
}
async function login(req, res) {
    const data = await Auth.login(req.body || {});
    return res.status(200).json(data);
}
async function sendVerification(req, res) {
    const out = await Verification.sendVerification(req.user.id);
    return res.status(202).json(out);
}
async function verifyEmail(req, res) {
    const token = req.query && req.query.token;
    const out = await Verification.verifyByToken(String(token));
    return res.status(204).send();
}
module.exports = { register, login, sendVerification, verifyEmail };
//# sourceMappingURL=authController.js.map