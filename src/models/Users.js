const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function getById(id) {
  return prisma.user.findUnique({ where: { id }, include: { employee: true, employer: true } })
}

async function updateById(id, data) {
  const allowed = {}
  if (typeof data.phone === 'string') allowed.phone = data.phone
  return prisma.user.update({ where: { id }, data: allowed })
}

async function getMeDto(userId) {
  const user = await prisma.user.findUnique({ where: { id: userId }, include: { employee: true, employer: true } })
  if (!user) return null
  const ratingCount = await prisma.review.count({ where: { revieweeId: userId } })
  const ratingAgg = await prisma.review.aggregate({ _avg: { rating: true }, where: { revieweeId: userId } })
  const applicationCounts = await prisma.jobApplication.groupBy({ by: ['status'], where: { workerId: userId }, _count: { _all: true } })
  const appMap = { pending: 0, accepted: 0, completed: 0, cancelled: 0 }
  applicationCounts.forEach((r) => { appMap[r.status] = r._count._all })
  let jobCounts = null
  let recentJobs = []
  if (user.isEmployer) {
    const totalJobs = await prisma.job.count({ where: { employerId: user.id } })
    const openJobs = await prisma.job.count({ where: { employerId: user.id, startDate: { gte: new Date() } } })
    jobCounts = { total: totalJobs, open: openJobs }
    recentJobs = await prisma.job.findMany({ where: { employerId: user.id }, orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, title: true, location: true, startDate: true, workerQuota: true, salary: true } })
  }
  let unreadNotifications = 0
  try {
    unreadNotifications = await prisma.notification.count({ where: { userId, readAt: null } })
  } catch (e) {
    try {
      unreadNotifications = await prisma.notification.count({ where: { userId, isRead: false } })
    } catch (_) {
      unreadNotifications = await prisma.notification.count({ where: { userId } })
    }
  }
  const recentApplications = await prisma.jobApplication.findMany({ where: { workerId: userId }, orderBy: { appliedAt: 'desc' }, take: 5, include: { job: { select: { id: true, title: true } } } })
  const applicationsPreview = recentApplications.map((a) => ({ applicationId: a.id, jobId: a.job ? a.job.id : null, jobTitle: a.job ? a.job.title : null, status: a.status, appliedAt: a.appliedAt }))
  const notificationsPreview = await prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' }, take: 5, select: { id: true, title: true, type: true, createdAt: true } })
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    isVerified: user.isVerified,
    isActive: user.isActive,
    bannedAt: user.bannedAt,
    lastLoginAt: user.lastLoginAt,
    isWorker: user.isWorker,
    isEmployer: user.isEmployer,
    workerProfile: user.employee ? { bio: user.employee.bio, skills: user.employee.skills, dob: user.employee.dob, gender: user.employee.gender } : null,
    employerProfile: user.employer ? { companyName: user.employer.companyName, companyAddress: user.employer.companyAddress } : null,
    ratingAvg: ratingAgg._avg.rating || 0,
    ratingCount,
    applicationCounts: appMap,
    jobCounts,
    unreadNotifications,
    recentApplications: applicationsPreview,
    recentJobs,
    notificationsPreview,
  }
}

module.exports = { getById, updateById, getMeDto }
