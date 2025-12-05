const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function list(query) {
  const where = {}
  if (query && query.location) where.location = { contains: query.location }

  const andFilters = []

  // Filter by skills: support skills=waiter,cashier and require ALL provided skills
  if (query && query.skills) {
    const skills = Array.isArray(query.skills)
      ? query.skills
      : String(query.skills)
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
    if (skills.length > 0) {
      skills.forEach((s) => {
        andFilters.push({ skills: { some: { skillName: s } } })
      })
    }
  }

  // Filter by date or range on JobSessions: date=YYYY-MM-DD or from/to
  if (query && (query.date || (query.from && query.to))) {
    let sessionFilter = {}
    if (query.date) {
      const d = new Date(query.date)
      const start = new Date(d)
      start.setHours(0, 0, 0, 0)
      const end = new Date(d)
      end.setHours(23, 59, 59, 999)
      sessionFilter = { sessionDate: { gte: start, lte: end } }
    } else if (query.from && query.to) {
      const from = new Date(query.from)
      const to = new Date(query.to)
      sessionFilter = { sessionDate: { gte: from, lte: to } }
    }
    andFilters.push({ sessions: { some: sessionFilter } })
  }

  if (query && (query.startDate || (query.startFrom && query.startTo))) {
    if (query.startDate) {
      const d = new Date(query.startDate)
      const start = new Date(d)
      start.setHours(0, 0, 0, 0)
      const end = new Date(d)
      end.setHours(23, 59, 59, 999)
      andFilters.push({ startDate: { gte: start, lte: end } })
    } else if (query.startFrom && query.startTo) {
      const from = new Date(query.startFrom)
      const to = new Date(query.startTo)
      andFilters.push({ startDate: { gte: from, lte: to } })
    }
  }

  const finalWhere = andFilters.length > 0 ? { AND: [where, ...andFilters] } : where
  return prisma.job.findMany({ where: finalWhere, include: { sessions: true, skills: true, employer: true } })
}

function detail(id) {
  return prisma.job.findUnique({ where: { id }, include: { sessions: true, skills: true, employer: true } })
}

async function create(userId, data) {
  const employer = await prisma.employerProfile.findUnique({ where: { userId } })
  if (!employer) throw new Error('Employer profile required')
  return prisma.job.create({
    data: {
      employerId: employer.id,
      title: data.title,
      description: data.description,
      location: data.location,
      startDate: new Date(data.startDate),
      durationDays: Number(data.durationDays || 1),
      workerQuota: Number(data.workerQuota || 1),
    },
  })
}

async function update(userId, id, data) {
  const job = await prisma.job.findUnique({ where: { id } })
  const employer = await prisma.employerProfile.findUnique({ where: { userId } })
  if (!job || !employer || job.employerId !== employer.id) throw new Error('Forbidden')
  const allowed = {}
  ;['title', 'description', 'location'].forEach((k) => {
    if (typeof data[k] === 'string') allowed[k] = data[k]
  })
  if (data.startDate) allowed.startDate = new Date(data.startDate)
  if (data.durationDays) allowed.durationDays = Number(data.durationDays)
  if (data.workerQuota) allowed.workerQuota = Number(data.workerQuota)
  return prisma.job.update({ where: { id }, data: allowed })
}

async function remove(userId, id) {
  const job = await prisma.job.findUnique({ where: { id } })
  const employer = await prisma.employerProfile.findUnique({ where: { userId } })
  if (!job || !employer || job.employerId !== employer.id) throw new Error('Forbidden')
  await prisma.job.delete({ where: { id } })
  return { success: true }
}

async function addSession(userId, jobId, data) {
  const job = await prisma.job.findUnique({ where: { id: jobId } })
  const employer = await prisma.employerProfile.findUnique({ where: { userId } })
  if (!job || !employer || job.employerId !== employer.id) throw new Error('Forbidden')
  return prisma.jobSession.create({
    data: {
      jobId,
      sessionDate: new Date(data.sessionDate),
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
    },
  })
}

function sessions(jobId) {
  return prisma.jobSession.findMany({ where: { jobId } })
}

async function addSkills(userId, jobId, body) {
  const job = await prisma.job.findUnique({ where: { id: jobId } })
  const employer = await prisma.employerProfile.findUnique({ where: { userId } })
  if (!job || !employer || job.employerId !== employer.id) throw new Error('Forbidden')
  const skills = Array.isArray(body.skills) ? body.skills : []
  await prisma.jobRequiredSkill.createMany({ data: skills.map((s) => ({ jobId, skillName: s })) })
  return { success: true }
}

module.exports = { list, detail, create, update, remove, addSession, sessions, addSkills }
