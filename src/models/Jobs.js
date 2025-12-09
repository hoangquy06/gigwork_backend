const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

function httpError(code, message) {
  const e = new Error(message)
  e.code = code
  return e
}

async function list(query) {
  const where = {}
  if (query && query.type) where.type = normalizeType(query.type)

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

  if (query && query.province) {
    andFilters.push({ locationRef: { province: { contains: String(query.province) } } })
  }
  if (query && query.city) {
    andFilters.push({ locationRef: { city: { contains: String(query.city) } } })
  }
  if (query && query.ward) {
    andFilters.push({ locationRef: { ward: { contains: String(query.ward) } } })
  }
  if (query && query.addressContains) {
    andFilters.push({ locationRef: { address: { contains: String(query.addressContains) } } })
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
  const page = Number(query && query.page) > 0 ? Number(query.page) : 1
  const size = Number(query && query.size) > 0 ? Number(query.size) : 20
  const skip = (page - 1) * size
  const sort = typeof (query && query.sort) === 'string' ? String(query.sort) : 'createdAt:desc'
  const [sortField, sortDir] = sort.split(':')
  const orderBy = { [sortField || 'createdAt']: (sortDir === 'asc' ? 'asc' : 'desc') }
  const [items, total] = await Promise.all([
    prisma.job.findMany({ where: finalWhere, include: { sessions: true, skills: true, employer: true, locationRef: true }, orderBy, skip, take: size }),
    prisma.job.count({ where: finalWhere })
  ])
  const now = new Date()
  const ids = items.map((j) => j.id)
  const acceptedByJob = await prisma.jobApplication.groupBy({ by: ['jobId'], where: { jobId: { in: ids }, status: 'accepted' }, _count: { jobId: true } })
  const mapAccepted = Object.fromEntries(acceptedByJob.map((r) => [r.jobId, r._count.jobId]))
  const computeStatus = (job) => {
    const end = new Date(job.startDate)
    end.setDate(end.getDate() + Number(job.durationDays || 1))
    if (now > end) return 'completed'
    if (now >= job.startDate && now <= end) return 'ongoing'
    const accepted = Number(mapAccepted[job.id] || 0)
    return accepted >= job.workerQuota ? 'full' : 'open'
  }
  const withStatus = items.map((j) => ({ ...j, status: computeStatus(j) }))
  return { items: withStatus, meta: { total, page, size, filters: query || {}, sort: orderBy } }
}

async function detail(id) {
  const job = await prisma.job.findUnique({ where: { id }, include: { sessions: true, skills: true, employer: true, locationRef: true } })
  if (!job) return null
  const now = new Date()
  const end = new Date(job.startDate)
  end.setDate(end.getDate() + Number(job.durationDays || 1))
  let status = 'open'
  if (now > end) status = 'completed'
  else if (now >= job.startDate && now <= end) status = 'ongoing'
  else {
    const accepted = await prisma.jobApplication.count({ where: { jobId: id, status: 'accepted' } })
    status = accepted >= job.workerQuota ? 'full' : 'open'
  }
  return { ...job, status }
}

async function create(userId, data) {
  const employer = await prisma.employerProfile.findUnique({ where: { userId } })
  if (!employer) throw httpError(403, 'Employer profile required')
  const title = typeof data.title === 'string' ? data.title.trim() : ''
  const description = typeof data.description === 'string' ? data.description : ''
  if (!title) throw httpError(400, 'title is required')
  const locObj = typeof data.location === 'object' && data.location !== null ? data.location : null
  if (!locObj || typeof locObj.province !== 'string' || typeof locObj.city !== 'string' || typeof locObj.address !== 'string') throw httpError(400, 'location object is required')
  const startDate = new Date(data.startDate)
  if (!data.startDate || isNaN(startDate.getTime())) throw httpError(400, 'startDate is invalid')
  let durationDays = Number(data.durationDays)
  let workerQuota = Number(data.workerQuota)
  let salary = Number(data.salary)
  if (!Number.isFinite(durationDays) || durationDays < 1) durationDays = 1
  if (!Number.isFinite(workerQuota) || workerQuota < 1) workerQuota = 1
  if (!Number.isFinite(salary) || salary < 1) throw httpError(400, 'salary is required and must be >= 1')
  const created = await prisma.$transaction(async (tx) => {
    const job = await tx.job.create({
      data: {
        employerId: userId,
        title,
        description,
        startDate,
        durationDays,
        workerQuota,
        salary,
        type: normalizeType(data.type),
        status: 'open',
      },
    })
    await tx.jobLocation.create({
      data: {
        jobId: job.id,
        province: String(locObj.province).trim(),
        city: String(locObj.city).trim(),
        ward: locObj.ward ? String(locObj.ward).trim() : null,
        address: String(locObj.address).trim(),
      },
    })
    await tx.job.update({ where: { id: job.id }, data: { locationId: job.id } })
    const sessions = Array.isArray(data.sessions) ? data.sessions : []
    if (sessions.length > 0) {
      const payload = sessions.map((s) => {
        const sessionDate = new Date(s && s.sessionDate)
        const startTime = new Date(s && s.startTime)
        const endTime = new Date(s && s.endTime)
        if (isNaN(sessionDate.getTime())) throw httpError(400, 'sessionDate is invalid')
        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) throw httpError(400, 'startTime/endTime are invalid')
        if (startTime >= endTime) throw httpError(400, 'startTime must be before endTime')
        return { jobId: job.id, sessionDate, startTime, endTime }
      })
      if (payload.length > 0) {
        await tx.jobSession.createMany({ data: payload })
        const firstSession = await tx.jobSession.findFirst({ where: { jobId: job.id }, orderBy: { id: 'asc' } })
        await tx.job.update({ where: { id: job.id }, data: { sessionId: firstSession ? firstSession.id : null } })
      }
    }
    const skillsArr = Array.isArray(data.skills) ? data.skills : []
    if (skillsArr.length > 0) {
      const clean = skillsArr
        .map((s) => (typeof s === 'string' ? s : (s && s.skillName ? s.skillName : '')))
        .map((s) => String(s).trim())
        .filter(Boolean)
      if (clean.length === 0) throw httpError(400, 'skills must be a non-empty array')
      await tx.jobRequiredSkill.createMany({ data: clean.map((s) => ({ jobId: job.id, skillName: s })) })
      const firstSkill = await tx.jobRequiredSkill.findFirst({ where: { jobId: job.id }, orderBy: { id: 'asc' } })
      await tx.job.update({ where: { id: job.id }, data: { skillId: firstSkill ? firstSkill.id : null } })
    }
    return job
  })
  const full = await prisma.job.findUnique({ where: { id: created.id }, include: { sessions: true, skills: true, employer: true, locationRef: true } })
  return full
}

function normalizeType(t) {
  const s = String(t || '').toLowerCase().trim()
  switch (s) {
    case 'physical work':
    case 'physical_work':
      return 'physical_work'
    case 'fnb':
      return 'fnb'
    case 'event':
      return 'event'
    case 'retail':
      return 'retail'
    default:
      return 'others'
  }
}

async function update(userId, id, data) {
  const job = await prisma.job.findUnique({ where: { id } })
  const employer = await prisma.employerProfile.findUnique({ where: { userId } })
  if (!job || !employer || job.employerId !== userId) throw httpError(403, 'Forbidden')
  const allowed = {}
  ;['title', 'description'].forEach((k) => {
    if (typeof data[k] === 'string') allowed[k] = data[k]
  })
  if (data.startDate) {
    const d = new Date(data.startDate)
    if (isNaN(d.getTime())) throw httpError(400, 'startDate is invalid')
    allowed.startDate = d
  }
  if (data.durationDays) {
    const n = Number(data.durationDays)
    if (!Number.isFinite(n) || n < 1) throw httpError(400, 'durationDays must be >= 1')
    allowed.durationDays = n
  }
  if (data.workerQuota) {
    const n = Number(data.workerQuota)
    if (!Number.isFinite(n) || n < 1) throw httpError(400, 'workerQuota must be >= 1')
    allowed.workerQuota = n
  }
  if (data.salary !== undefined) {
    const n = Number(data.salary)
    if (!Number.isFinite(n) || n < 1) throw httpError(400, 'salary must be >= 1')
    allowed.salary = n
  }
  const locObj = typeof data.location === 'object' && data.location !== null ? data.location : null
  if (locObj) {
    await prisma.$transaction(async (tx) => {
      await tx.jobLocation.upsert({
        where: { jobId: id },
        update: {
          province: String(locObj.province || '').trim(),
          city: String(locObj.city || '').trim(),
          ward: locObj.ward ? String(locObj.ward).trim() : null,
          address: String(locObj.address || '').trim(),
        },
        create: {
          jobId: id,
          province: String(locObj.province || '').trim(),
          city: String(locObj.city || '').trim(),
          ward: locObj.ward ? String(locObj.ward).trim() : null,
          address: String(locObj.address || '').trim(),
        },
      })
      await tx.job.update({ where: { id }, data: { locationId: id } })
    })
  }
  const updated = await prisma.job.update({ where: { id }, data: allowed })

  if (Array.isArray(data.sessions)) {
    const payload = data.sessions.map((s) => {
      const sessionDate = new Date(s && s.sessionDate)
      const startTime = new Date(s && s.startTime)
      const endTime = new Date(s && s.endTime)
      if (isNaN(sessionDate.getTime())) throw httpError(400, 'sessionDate is invalid')
      if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) throw httpError(400, 'startTime/endTime are invalid')
      if (startTime >= endTime) throw httpError(400, 'startTime must be before endTime')
      return { jobId: id, sessionDate, startTime, endTime }
    })
    await prisma.$transaction(async (tx) => {
      await tx.jobSession.deleteMany({ where: { jobId: id } })
      if (payload.length > 0) await tx.jobSession.createMany({ data: payload })
      const firstSession = await tx.jobSession.findFirst({ where: { jobId: id }, orderBy: { id: 'asc' } })
      await tx.job.update({ where: { id }, data: { sessionId: firstSession ? firstSession.id : null } })
    })
  }

  if (Array.isArray(data.skills)) {
    const clean = data.skills
      .map((s) => (typeof s === 'string' ? s : (s && s.skillName ? s.skillName : '')))
      .map((s) => String(s).trim())
      .filter(Boolean)
    if (data.skills.length > 0 && clean.length === 0) throw httpError(400, 'skills must be a non-empty array')
    await prisma.$transaction(async (tx) => {
      await tx.jobRequiredSkill.deleteMany({ where: { jobId: id } })
      if (clean.length > 0) await tx.jobRequiredSkill.createMany({ data: clean.map((s) => ({ jobId: id, skillName: s })) })
      const firstSkill = await tx.jobRequiredSkill.findFirst({ where: { jobId: id }, orderBy: { id: 'asc' } })
      await tx.job.update({ where: { id }, data: { skillId: firstSkill ? firstSkill.id : null } })
    })
  }

  const full = await prisma.job.findUnique({ where: { id }, include: { sessions: true, skills: true, employer: true, locationRef: true } })
  return full
}

async function remove(userId, id) {
  const job = await prisma.job.findUnique({ where: { id } })
  const employer = await prisma.employerProfile.findUnique({ where: { userId } })
  if (!job || !employer || job.employerId !== userId) throw httpError(403, 'Forbidden')
  await prisma.$transaction(async (tx) => {
    await tx.jobApplication.deleteMany({ where: { jobId: id } })
    await tx.review.deleteMany({ where: { jobId: id } })
    await tx.jobSession.deleteMany({ where: { jobId: id } })
    await tx.jobRequiredSkill.deleteMany({ where: { jobId: id } })
    await tx.jobLocation.deleteMany({ where: { jobId: id } })
    await tx.job.delete({ where: { id } })
  })
  return { success: true }
}

async function addSession(userId, jobId, data) {
  const job = await prisma.job.findUnique({ where: { id: jobId } })
  const employer = await prisma.employerProfile.findUnique({ where: { userId } })
  if (!job || !employer || job.employerId !== userId) throw httpError(403, 'Forbidden')
  const sessionDate = new Date(data.sessionDate)
  const startTime = new Date(data.startTime)
  const endTime = new Date(data.endTime)
  if (isNaN(sessionDate.getTime())) throw httpError(400, 'sessionDate is invalid')
  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) throw httpError(400, 'startTime/endTime are invalid')
  if (startTime >= endTime) throw httpError(400, 'startTime must be before endTime')
  return prisma.jobSession.create({
    data: {
      jobId,
      sessionDate,
      startTime,
      endTime,
    },
  })
}

function sessions(jobId) {
  return prisma.jobSession.findMany({ where: { jobId } })
}

async function addSkills(userId, jobId, body) {
  const job = await prisma.job.findUnique({ where: { id: jobId } })
  const employer = await prisma.employerProfile.findUnique({ where: { userId } })
  if (!job || !employer || job.employerId !== userId) throw httpError(403, 'Forbidden')
  const skills = Array.isArray(body.skills) ? body.skills : []
  const clean = skills.map((s) => String(s).trim()).filter(Boolean)
  if (clean.length === 0) throw httpError(400, 'skills must be a non-empty array')
  await prisma.jobRequiredSkill.createMany({ data: clean.map((s) => ({ jobId, skillName: s })) })
  return { success: true }
}

async function getLocation(jobId) {
  return prisma.jobLocation.findUnique({ where: { jobId } })
}

async function updateLocation(userId, jobId, body) {
  const job = await prisma.job.findUnique({ where: { id: jobId } })
  const employer = await prisma.employerProfile.findUnique({ where: { userId } })
  if (!job || !employer || job.employerId !== userId) throw httpError(403, 'Forbidden')
  const province = String(body.province || '').trim()
  const city = String(body.city || '').trim()
  const ward = body.ward ? String(body.ward).trim() : null
  const address = String(body.address || '').trim()
  if (!province || !city || !address) throw httpError(400, 'location fields are required')
  const out = await prisma.$transaction(async (tx) => {
    const loc = await tx.jobLocation.upsert({
      where: { jobId: jobId },
      update: { province, city, ward, address },
      create: { jobId: jobId, province, city, ward, address },
    })
    await tx.job.update({ where: { id: jobId }, data: { locationId: jobId } })
    return loc
  })
  return out
}

module.exports = { list, detail, create, update, remove, addSession, sessions, addSkills, getLocation, updateLocation }
