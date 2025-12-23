const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function create(userId, body) {
  const app = await prisma.jobApplication.findUnique({ where: { id: Number(body.applicationId) } })
  if (!app) throw new Error('Invalid application')
  const job = await prisma.job.findUnique({ where: { id: app.jobId } })
  
  // Allow review if Job is completed OR Application is completed (isComplete flag or status)
  const isAppCompleted = app.isComplete || app.status === 'completed';
  if (job.status !== 'completed' && !isAppCompleted) {
      throw new Error('Review not allowed: Job or Application is not completed')
  }

  const employer = await prisma.employerProfile.findUnique({ where: { userId: job.employerId } })
  const isReviewerAllowed = userId === app.workerId || (employer && employer.userId === userId)
  if (!isReviewerAllowed) throw new Error('Forbidden')
  if (userId === app.workerId) {
    if (!employer || Number(body.revieweeId) !== employer.userId) throw new Error('Invalid reviewee')
  } else if (employer && employer.userId === userId) {
    if (Number(body.revieweeId) !== app.workerId) throw new Error('Invalid reviewee')
  }
  return prisma.review.create({
    data: {
      jobId: app.jobId,
      reviewerId: userId,
      revieweeId: Number(body.revieweeId),
      comment: body.comment ?? null,
    },
  })
}

function list(userId) {
  return prisma.review.findMany({
    where: { revieweeId: userId },
    orderBy: { createdAt: 'desc' },
    include: {
      reviewer: { select: { id: true, email: true } },
      job: { select: { id: true, title: true } },
    },
  })
}

module.exports = { create, list }
