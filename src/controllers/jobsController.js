const Jobs = require('../models/Jobs')

async function list(req, res) {
  const items = await Jobs.list(req.query || {})
  const meta = { count: Array.isArray(items) ? items.length : 0, filters: req.query || {} }
  return res.status(200).json({ items, meta })
}

async function detail(req, res) {
  const data = await Jobs.detail(Number(req.params.id))
  return res.status(200).json(data)
}

async function create(req, res) {
  const data = await Jobs.create(req.user.id, req.body || {})
  return res.status(201).location(`/api/jobs/${data.id}`).json(data)
}

async function update(req, res) {
  const data = await Jobs.update(req.user.id, Number(req.params.id), req.body || {})
  return res.status(200).json(data)
}

async function remove(req, res) {
  const data = await Jobs.remove(req.user.id, Number(req.params.id))
  return res.status(204).send()
}

async function addSession(req, res) {
  const data = await Jobs.addSession(req.user.id, Number(req.params.id), req.body || {})
  return res.status(201).location(`/api/jobs/${req.params.id}/sessions`).json(data)
}

async function sessions(req, res) {
  const data = await Jobs.sessions(Number(req.params.id))
  return res.status(200).json(data)
}

async function addSkills(req, res) {
  const data = await Jobs.addSkills(req.user.id, Number(req.params.id), req.body || {})
  const skills = Array.isArray(req.body && req.body.skills) ? req.body.skills : []
  return res.status(201).json({ created: skills.length, skills })
}

module.exports = { list, detail, create, update, remove, addSession, sessions, addSkills }
