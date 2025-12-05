const Notifications = require('../models/Notifications')

async function list(req, res) {
  const data = await Notifications.list(req.user.id)
  return res.json({ statusCode: 200, message: 'Operation successful', data })
}

module.exports = { list }
