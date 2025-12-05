const Auth = require('../models/Auth')
const Verification = require('../models/Verification')

async function register(req, res) {
  const data = await Auth.register(req.body || {})
  return res.json({ statusCode: 200, message: 'Operation successful', data })
}

async function login(req, res) {
  const data = await Auth.login(req.body || {})
  return res.json({ statusCode: 200, message: 'Operation successful', data })
}

async function sendVerification(req, res) {
  const out = await Verification.sendVerification(req.user.id)
  return res.json({ statusCode: 200, message: 'Operation successful', data: out })
}

async function verifyEmail(req, res) {
  const token = req.query && req.query.token
  const out = await Verification.verifyByToken(String(token))
  return res.json({ statusCode: 200, message: 'Operation successful', data: out })
}

module.exports = { register, login, sendVerification, verifyEmail }
