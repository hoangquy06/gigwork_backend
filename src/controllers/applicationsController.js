const Apps = require('../models/Applications')

async function listMine(req, res) {
  const items = await Apps.listForUser(req.user.id)
  return res.status(200).json(items)
}

async function getById(req, res) {
  const id = Number(req.params.id)
  if (!Number.isFinite(id) || id <= 0) return res.status(400).json({ type: 'about:blank', title: 'Bad Request', status: 400, detail: 'id is required', instance: req.originalUrl })
  const item = await Apps.detailForUser(req.user.id, id)
  if (!item) return res.status(404).json({ type: 'about:blank', title: 'Not Found', status: 404, detail: 'Application not found', instance: req.originalUrl })
  return res.status(200).json(item)
}

async function apply(req, res) {
  const application = await Apps.apply(req.user.id, req.body || {})
  const Users = require('../models/Users')
  const employee = await Users.getMeDto(req.user.id)
  return res.status(201).location(`/api/applications/${application.id}`).json({ application, employee })
}

async function accept(req, res) {
  const applicationId = Number(req.body && req.body.applicationId)
  const data = await Apps.accept(req.user.id, applicationId)
  return res.status(200).json(data)
}

async function complete(req, res) {
  const jobId = Number(req.body && req.body.jobId)
  const workerId = Number(req.body && req.body.workerId)
  const data = await Apps.completeJobs(req.user.id, jobId, workerId)
  return res.status(200).json(data)
}


async function reject(req, res) {
  const applicationId = Number(req.body && req.body.applicationId)
  const data = await Apps.reject(req.user.id, applicationId)
  return res.status(200).json(data)
}

module.exports = { listMine, getById, apply, accept, complete, completePaid, reject }
async function completePaid(req, res) {
  const applicationId = Number(req.body && req.body.applicationId)
  const data = await Apps.completePaid(req.user.id, applicationId)
  return res.status(200).json(data)
}
