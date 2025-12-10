const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function listForUser(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return []
  if (user.isEmployer) {
    const apps = await prisma.jobApplication.findMany({
      where: { job: { employerId: userId } },
      include: {
        job: { select: { id: true, title: true, employerId: true, startDate: true, durationDays: true, salary: true } },
        worker: { select: { id: true, email: true } },
      },
      orderBy: { appliedAt: 'desc' },
    })
    return apps
  } else {
    const apps = await prisma.jobApplication.findMany({
      where: { workerId: userId },
      include: {
        job: { select: { id: true, title: true, employerId: true, startDate: true, durationDays: true, salary: true } },
        worker: { select: { id: true, email: true } },
      },
      orderBy: { appliedAt: 'desc' },
    })
    return apps
  }
}

async function detailForUser(userId, appId) {
  const app = await prisma.jobApplication.findUnique({
    where: { id: appId },
    include: {
      job: { select: { id: true, title: true, employerId: true, startDate: true, durationDays: true, salary: true } },
      worker: { select: { id: true, email: true } },
    },
  })
  if (!app) return null
  if (app.workerId !== userId && app.job.employerId !== userId) {
    const e = new Error('Forbidden')
    e.code = 403
    throw e
  }
  return app
}


async function accept(userId, appId) {
  const app = await prisma.jobApplication.findUnique({ where: { id: appId } })
  if (!app) return null
  const job = await prisma.job.findUnique({ where: { id: app.jobId } })
  const employer = await prisma.employerProfile.findUnique({ where: { userId } })
  if (!job || !employer || job.employerId !== userId) throw new Error('Forbidden')
  const count = await prisma.jobApplication.count({ where: { jobId: app.jobId, status: 'accepted' } })
  if (count >= job.workerQuota) {
    const e = new Error('Quota reached')
    e.code = 409
    e.errorCode = 'APPLICATIONS_QUOTA_REACHED'
    e.content = { accepted: count, workerQuota: job.workerQuota, jobId: app.jobId }
    throw e
  }
  const updated = await prisma.jobApplication.update({ where: { id: appId }, data: { status: 'accepted' } })
  await prisma.notification.create({ data: { userId: app.workerId, type: 'application.accepted', title: 'Application accepted', content: `Your application for "${job.title}" was accepted` } })
  return updated
}


// removed: use completeJobs and completePaid instead

async function completeJobs(userId, jobId, workerId) {
  const app = await prisma.jobApplication.findFirst({ where: { jobId: Number(jobId), workerId: Number(workerId) } })
  if (!app) throw new Error('Invalid application')
  const job = await prisma.job.findUnique({ where: { id: app.jobId } })
  if (!job) throw new Error('Invalid job')
  const employer = await prisma.employerProfile.findUnique({ where: { userId } })
  if (!employer || job.employerId !== userId) throw new Error('Forbidden')
  const end = new Date(job.startDate)
  end.setDate(end.getDate() + Number(job.durationDays || 1))
  if (new Date() < end) throw new Error('Job not ended')
  const updated = await prisma.jobApplication.update({ where: { id: app.id }, data: { isComplete: true } })
  await prisma.notification.create({ data: { userId: app.workerId, type: 'application.completed', title: 'Job completed', content: `You completed job "${job.title}"` } })
  return updated
}

async function completePaid(userId, appId) {
  const app = await prisma.jobApplication.findUnique({ where: { id: Number(appId) } })
  if (!app) throw new Error('Invalid application')
  if (app.workerId !== userId) throw new Error('Forbidden')
  if (!app.isComplete && app.status !== 'completed') {
    const e = new Error('Job not completed')
    e.code = 409
    e.errorCode = 'JOB_NOT_COMPLETED'
    throw e
  }
  return prisma.jobApplication.update({ where: { id: app.id }, data: { isPaid: true } })
}

async function cancel(userId, appId) {
  const app = await prisma.jobApplication.findUnique({ where: { id: appId } })
  if (!app || app.workerId !== userId) throw new Error('Forbidden')
  const updated = await prisma.jobApplication.update({ where: { id: appId }, data: { status: 'cancelled' } })
  const job = await prisma.job.findUnique({ where: { id: app.jobId } })
  await prisma.notification.create({ data: { userId: job.employerId, type: 'application.cancelled', title: 'Application cancelled', content: `Employer cancelled application for "${job.title}"` } })
  return updated
}

async function reject(userId, appId) {
  const app = await prisma.jobApplication.findUnique({ where: { id: appId } })
  if (!app) return null
  const job = await prisma.job.findUnique({ where: { id: app.jobId } })
  const employer = await prisma.employerProfile.findUnique({ where: { userId } })
  if (!job || !employer || job.employerId !== userId) throw new Error('Forbidden')
  const updated = await prisma.jobApplication.update({ where: { id: appId }, data: { status: 'cancelled' } })
  await prisma.notification.create({ data: { userId: app.workerId, type: 'application.rejected', title: 'Application rejected', content: `Your application for "${job.title}" was rejected` } })
  return updated
}

async function apply(userId, body) {
  const worker = await prisma.employeeProfile.findUnique({ where: { userId } })
  if (!worker) throw new Error('Employee profile required')
  const jobId = Number(body.jobId)
  const job = await prisma.job.findUnique({ where: { id: jobId } })
  if (!job) throw new Error('Job not found')
  const now = new Date()
  const end = new Date(job.startDate)
  end.setDate(end.getDate() + Number(job.durationDays || 1))
  if (now >= job.startDate) {
    const e = new Error('Job not open for application')
    e.code = 409
    e.errorCode = 'JOB_NOT_OPEN'
    e.hint = 'Applications are only allowed before startDate'
    throw e
  }
  const accepted = await prisma.jobApplication.count({ where: { jobId, status: 'accepted' } })
  if (accepted >= job.workerQuota) {
    const e = new Error('Job is full')
    e.code = 409
    e.errorCode = 'JOB_FULL'
    e.content = { accepted, workerQuota: job.workerQuota, jobId }
    throw e
  }
  const created = await prisma.jobApplication.create({ data: { jobId, workerId: userId } })
  const employer = await prisma.employerProfile.findUnique({ where: { id: job.employerId } })
  if (employer) await prisma.notification.create({ data: { userId: employer.userId, type: 'application.pending', title: 'New application', content: `A worker applied to "${job.title}"` } })
  return created
}

module.exports = { apply, accept, completeJobs, completePaid, reject, listForUser, detailForUser }
