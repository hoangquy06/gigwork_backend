const Images = require('../models/ProfileImages')

async function uploadEmployee(req, res) {
  const kind = (req.body && req.body.kind) || 'avatar'
  const setPrimary = String((req.body && req.body.setPrimary) || '').toLowerCase() === 'true'
  const meta = await Images.upload(req.user.id, 'employee', kind, req.file, setPrimary)
  return res.status(201).json(meta)
}

async function uploadEmployer(req, res) {
  const kind = (req.body && req.body.kind) || 'company_logo'
  const setPrimary = String((req.body && req.body.setPrimary) || '').toLowerCase() === 'true'
  const meta = await Images.upload(req.user.id, 'employer', kind, req.file, setPrimary)
  return res.status(201).json(meta)
}

async function getEmployeePrimary(req, res) {
  const kind = (req.query && req.query.kind) || 'avatar'
  const img = await Images.getPrimary(req.user.id, 'employee', kind)
  if (!img) return res.status(404).type('application/problem+json').json({ type: 'about:blank', title: 'Not Found', status: 404, detail: 'Image not found', instance: req.originalUrl })
  res.setHeader('Content-Type', img.contentType)
  res.setHeader('Content-Length', img.size)
  return res.status(200).send(Buffer.from(img.data))
}

async function getEmployerPrimary(req, res) {
  const kind = (req.query && req.query.kind) || 'company_logo'
  const img = await Images.getPrimary(req.user.id, 'employer', kind)
  if (!img) return res.status(404).type('application/problem+json').json({ type: 'about:blank', title: 'Not Found', status: 404, detail: 'Image not found', instance: req.originalUrl })
  res.setHeader('Content-Type', img.contentType)
  res.setHeader('Content-Length', img.size)
  return res.status(200).send(Buffer.from(img.data))
}

async function setEmployeePrimary(req, res) {
  const img = await Images.setPrimary(req.user.id, req.params.id)
  return res.status(200).json({ id: img.id, isPrimary: img.isPrimary })
}

async function setEmployerPrimary(req, res) {
  const img = await Images.setPrimary(req.user.id, req.params.id)
  return res.status(200).json({ id: img.id, isPrimary: img.isPrimary })
}

async function deleteImage(req, res) {
  const out = await Images.remove(req.user.id, req.params.id)
  return res.status(200).json(out)
}

module.exports = { uploadEmployee, uploadEmployer, getEmployeePrimary, getEmployerPrimary, setEmployeePrimary, setEmployerPrimary, deleteImage }
