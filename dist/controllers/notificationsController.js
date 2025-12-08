"use strict";
const Notifications = require('../models/Notifications');
async function list(req, res) {
    const out = await Notifications.list(req.user.id, req.query || {});
    return res.status(200).json(out);
}
module.exports = { list };
//# sourceMappingURL=notificationsController.js.map