const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function apply(userId, body) {
  const worker = await prisma.employeeProfile.findUnique({ where: { userId } })
  if (!worker) throw new Error('Employee profile required')
  return prisma.jobApplication.create({ data: { jobId: Number(body.jobId), workerId: userId } })
}

async function accept(userId, appId) {
  const app = await prisma.jobApplication.findUnique({ where: { id: appId } })
  if (!app) return null
  const job = await prisma.job.findUnique({ where: { id: app.jobId } })
  const employer = await prisma.employerProfile.findUnique({ where: { userId } })
  if (!job || !employer || job.employerId !== employer.id) throw new Error('Forbidden')
  const count = await prisma.jobApplication.count({ where: { jobId: app.jobId, status: 'accepted' } })
  if (count >= job.workerQuota) throw new Error('Quota reached')
  return prisma.jobApplication.update({ where: { id: appId }, data: { status: 'accepted' } })
}

async function confirm(userId, appId) {
  const app = await prisma.jobApplication.findUnique({ where: { id: appId } })
  if (!app || app.workerId !== userId) throw new Error('Forbidden')
  return prisma.jobApplication.update({ where: { id: appId }, data: { status: 'confirmed' } })
}

async function complete(userId, appId) {
  const app = await prisma.jobApplication.findUnique({ where: { id: appId } })
  if (!app || app.workerId !== userId) throw new Error('Forbidden')
  return prisma.jobApplication.update({ where: { id: appId }, data: { status: 'completed' } })
}

async function cancel(userId, appId) {
  const app = await prisma.jobApplication.findUnique({ where: { id: appId } })
  if (!app || app.workerId !== userId) throw new Error('Forbidden')
  return prisma.jobApplication.update({ where: { id: appId }, data: { status: 'cancelled' } })
}

module.exports = { apply, accept, confirm, complete, cancel }
