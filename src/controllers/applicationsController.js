const Apps = require('../models/Applications')

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
  const applicationId = Number(req.body && req.body.applicationId)
  const data = await Apps.complete(req.user.id, applicationId)
  return res.status(200).json(data)
}


async function reject(req, res) {
  const applicationId = Number(req.body && req.body.applicationId)
  const data = await Apps.reject(req.user.id, applicationId)
  return res.status(200).json(data)
}

module.exports = { apply, accept, complete, reject }
