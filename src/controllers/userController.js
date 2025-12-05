const Users = require('../models/Users')

async function me(req, res) {
  const user = await Users.getMeDto(req.user.id)
  return res.json({ statusCode: 200, message: 'Operation successful', data: user })
}

async function updateMe(req, res) {
  const user = await Users.updateById(req.user.id, req.body || {})
  return res.json({ statusCode: 200, message: 'Operation successful', data: user })
}

module.exports = { me, updateMe }
