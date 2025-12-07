const Apps = require('../models/Applications')

async function apply(req, res) {
  const data = await Apps.apply(req.user.id, req.body || {})
  return res.status(201).location(`/api/applications/${data.id}`).json(data)
}

async function accept(req, res) {
  const data = await Apps.accept(req.user.id, Number(req.params.id))
  return res.status(200).json(data)
}

async function confirm(req, res) {
  const data = await Apps.confirm(req.user.id, Number(req.params.id))
  return res.status(200).json(data)
}

async function complete(req, res) {
  const data = await Apps.complete(req.user.id, Number(req.params.id))
  return res.status(200).json(data)
}

async function cancel(req, res) {
  const data = await Apps.cancel(req.user.id, Number(req.params.id))
  return res.status(200).json(data)
}

module.exports = { apply, accept, confirm, complete, cancel }
