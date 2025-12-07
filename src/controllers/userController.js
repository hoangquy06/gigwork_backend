const Users = require('../models/Users')

async function me(req, res) {
  const user = await Users.getMeDto(req.user.id)
  return res.status(200).json(user)
}

async function updateMe(req, res) {
  const user = await Users.updateById(req.user.id, req.body || {})
  return res.status(200).json(user)
}

module.exports = { me, updateMe }
