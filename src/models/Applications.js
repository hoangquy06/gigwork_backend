const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()


async function accept(userId, appId) {
  const app = await prisma.jobApplication.findUnique({ where: { id: appId } })
  if (!app) return null
  const job = await prisma.job.findUnique({ where: { id: app.jobId } })
  const employer = await prisma.employerProfile.findUnique({ where: { userId } })
  if (!job || !employer || job.employerId !== employer.id) throw new Error('Forbidden')
  const count = await prisma.jobApplication.count({ where: { jobId: app.jobId, status: 'accepted' } })
  if (count >= job.workerQuota) throw new Error('Quota reached')
  const updated = await prisma.jobApplication.update({ where: { id: appId }, data: { status: 'accepted' } })
  await prisma.notification.create({ data: { userId: app.workerId, type: 'application.accepted', title: 'Application accepted', content: `Your application for "${job.title}" was accepted` } })
  return updated
}


async function complete(userId, appId) {
  const app = await prisma.jobApplication.findUnique({ where: { id: appId } })
  if (!app || app.workerId !== userId) throw new Error('Forbidden')
  const job = await prisma.job.findUnique({ where: { id: app.jobId } })
  if (!job) throw new Error('Invalid job')
  const end = new Date(job.startDate)
  end.setDate(end.getDate() + Number(job.durationDays || 1))
  if (new Date() < end) throw new Error('Job not ended')
  const updated = await prisma.jobApplication.update({ where: { id: appId }, data: { status: 'completed' } })
  const employer = await prisma.employerProfile.findUnique({ where: { id: job.employerId } })
  if (employer) {
    await prisma.notification.create({ data: { userId: employer.userId, type: 'application.completed', title: 'Job completed', content: `employee completed job "${job.title}"` } })
  }
  await prisma.notification.create({ data: { userId: app.workerId, type: 'application.completed', title: 'Job completed', content: `You completed job "${job.title}"` } })
  return updated
}

async function cancel(userId, appId) {
  const app = await prisma.jobApplication.findUnique({ where: { id: appId } })
  if (!app || app.workerId !== userId) throw new Error('Forbidden')
  const updated = await prisma.jobApplication.update({ where: { id: appId }, data: { status: 'cancelled' } })
  const job = await prisma.job.findUnique({ where: { id: app.jobId } })
  const employer = await prisma.employerProfile.findUnique({ where: { id: job.employerId } })
  if (employer) await prisma.notification.create({ data: { userId: employer.userId, type: 'application.cancelled', title: 'Application cancelled', content: `Employer cancelled application for "${job.title}"` } })
  return updated
}

async function reject(userId, appId) {
  const app = await prisma.jobApplication.findUnique({ where: { id: appId } })
  if (!app) return null
  const job = await prisma.job.findUnique({ where: { id: app.jobId } })
  const employer = await prisma.employerProfile.findUnique({ where: { userId } })
  if (!job || !employer || job.employerId !== employer.id) throw new Error('Forbidden')
  const updated = await prisma.jobApplication.update({ where: { id: appId }, data: { status: 'cancelled' } })
  await prisma.notification.create({ data: { userId: app.workerId, type: 'application.rejected', title: 'Application rejected', content: `Your application for "${job.title}" was rejected` } })
  return updated
}

async function apply(userId, body) {
  const worker = await prisma.employeeProfile.findUnique({ where: { userId } })
  if (!worker) throw new Error('Employee profile required')
  const created = await prisma.jobApplication.create({ data: { jobId: Number(body.jobId), workerId: userId } })
  const job = await prisma.job.findUnique({ where: { id: created.jobId } })
  const employer = await prisma.employerProfile.findUnique({ where: { id: job.employerId } })
  if (employer) await prisma.notification.create({ data: { userId: employer.userId, type: 'application.pending', title: 'New application', content: `A worker applied to "${job.title}"` } })
  return created
}

module.exports = { apply, accept, complete, reject }
