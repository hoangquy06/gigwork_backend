"use strict";
const Reviews = require('../models/Reviews');
async function create(req, res) {
    const data = await Reviews.create(req.user.id, req.body || {});
    return res.status(201).location(`/api/reviews/${data.id}`).json(data);
}
async function list(req, res) {
    const data = await Reviews.list(Number(req.params.userId));
    return res.status(200).json(data);
}
module.exports = { create, list };
//# sourceMappingURL=reviewsController.js.map