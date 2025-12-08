const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function create(userId, body) {
  const app = await prisma.jobApplication.findUnique({ where: { id: Number(body.applicationId) } })
  if (!app) throw new Error('Invalid application')
  if (app.status !== 'completed') throw new Error('Review not allowed')
  const job = await prisma.job.findUnique({ where: { id: app.jobId } })
  const employer = await prisma.employerProfile.findUnique({ where: { id: job.employerId } })
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
      rating: Number(body.rating),
      comment: body.comment ?? null,
    },
  })
}

function list(userId) {
  return prisma.review.findMany({ where: { revieweeId: userId } })
}

module.exports = { create, list }
