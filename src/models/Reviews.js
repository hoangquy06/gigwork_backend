const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function create(userId, body) {
  const app = await prisma.jobApplication.findUnique({ where: { id: Number(body.applicationId) } })
  if (!app) throw new Error('Invalid application')
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
