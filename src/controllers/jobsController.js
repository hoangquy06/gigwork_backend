const Jobs = require('../models/Jobs')

async function list(req, res) {
  const data = await Jobs.list(req.query || {})
  return res.json({ statusCode: 200, message: 'Operation successful', data })
}

async function detail(req, res) {
  const data = await Jobs.detail(Number(req.params.id))
  return res.json({ statusCode: 200, message: 'Operation successful', data })
}

async function create(req, res) {
  const data = await Jobs.create(req.user.id, req.body || {})
  return res.json({ statusCode: 200, message: 'Operation successful', data })
}

async function update(req, res) {
  const data = await Jobs.update(req.user.id, Number(req.params.id), req.body || {})
  return res.json({ statusCode: 200, message: 'Operation successful', data })
}

async function remove(req, res) {
  const data = await Jobs.remove(req.user.id, Number(req.params.id))
  return res.json({ statusCode: 200, message: 'Operation successful', data })
}

async function addSession(req, res) {
  const data = await Jobs.addSession(req.user.id, Number(req.params.id), req.body || {})
  return res.json({ statusCode: 200, message: 'Operation successful', data })
}

async function sessions(req, res) {
  const data = await Jobs.sessions(Number(req.params.id))
  return res.json({ statusCode: 200, message: 'Operation successful', data })
}

async function addSkills(req, res) {
  const data = await Jobs.addSkills(req.user.id, Number(req.params.id), req.body || {})
  return res.json({ statusCode: 200, message: 'Operation successful', data })
}

module.exports = { list, detail, create, update, remove, addSession, sessions, addSkills }
