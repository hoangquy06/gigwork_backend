"use strict";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
function httpError(code, message) {
    const e = new Error(message);
    e.code = code;
    return e;
}
async function list(query) {
    const where = {};
    if (query && query.location)
        where.location = { contains: query.location };
    if (query && query.type)
        where.type = normalizeType(query.type);
    const andFilters = [];
    // Filter by skills: support skills=waiter,cashier and require ALL provided skills
    if (query && query.skills) {
        const skills = Array.isArray(query.skills)
            ? query.skills
            : String(query.skills)
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean);
        if (skills.length > 0) {
            skills.forEach((s) => {
                andFilters.push({ skills: { some: { skillName: s } } });
            });
        }
    }
    // Filter by date or range on JobSessions: date=YYYY-MM-DD or from/to
    if (query && (query.date || (query.from && query.to))) {
        let sessionFilter = {};
        if (query.date) {
            const d = new Date(query.date);
            const start = new Date(d);
            start.setHours(0, 0, 0, 0);
            const end = new Date(d);
            end.setHours(23, 59, 59, 999);
            sessionFilter = { sessionDate: { gte: start, lte: end } };
        }
        else if (query.from && query.to) {
            const from = new Date(query.from);
            const to = new Date(query.to);
            sessionFilter = { sessionDate: { gte: from, lte: to } };
        }
        andFilters.push({ sessions: { some: sessionFilter } });
    }
    if (query && (query.startDate || (query.startFrom && query.startTo))) {
        if (query.startDate) {
            const d = new Date(query.startDate);
            const start = new Date(d);
            start.setHours(0, 0, 0, 0);
            const end = new Date(d);
            end.setHours(23, 59, 59, 999);
            andFilters.push({ startDate: { gte: start, lte: end } });
        }
        else if (query.startFrom && query.startTo) {
            const from = new Date(query.startFrom);
            const to = new Date(query.startTo);
            andFilters.push({ startDate: { gte: from, lte: to } });
        }
    }
    const finalWhere = andFilters.length > 0 ? { AND: [where, ...andFilters] } : where;
    const page = Number(query && query.page) > 0 ? Number(query.page) : 1;
    const size = Number(query && query.size) > 0 ? Number(query.size) : 20;
    const skip = (page - 1) * size;
    const sort = typeof (query && query.sort) === 'string' ? String(query.sort) : 'createdAt:desc';
    const [sortField, sortDir] = sort.split(':');
    const orderBy = { [sortField || 'createdAt']: (sortDir === 'asc' ? 'asc' : 'desc') };
    const [items, total] = await Promise.all([
        prisma.job.findMany({ where: finalWhere, include: { sessions: true, skills: true, employer: true }, orderBy, skip, take: size }),
        prisma.job.count({ where: finalWhere })
    ]);
    const now = new Date();
    const ids = items.map((j) => j.id);
    const acceptedByJob = await prisma.jobApplication.groupBy({ by: ['jobId'], where: { jobId: { in: ids }, status: 'accepted' }, _count: { jobId: true } });
    const mapAccepted = Object.fromEntries(acceptedByJob.map((r) => [r.jobId, r._count.jobId]));
    const computeStatus = (job) => {
        const end = new Date(job.startDate);
        end.setDate(end.getDate() + Number(job.durationDays || 1));
        if (now > end)
            return 'completed';
        if (now >= job.startDate && now <= end)
            return 'ongoing';
        const accepted = Number(mapAccepted[job.id] || 0);
        return accepted >= job.workerQuota ? 'full' : 'open';
    };
    const withStatus = items.map((j) => ({ ...j, status: computeStatus(j) }));
    return { items: withStatus, meta: { total, page, size, filters: query || {}, sort: orderBy } };
}
async function detail(id) {
    const job = await prisma.job.findUnique({ where: { id }, include: { sessions: true, skills: true, employer: true } });
    if (!job)
        return null;
    const now = new Date();
    const end = new Date(job.startDate);
    end.setDate(end.getDate() + Number(job.durationDays || 1));
    let status = 'open';
    if (now > end)
        status = 'completed';
    else if (now >= job.startDate && now <= end)
        status = 'ongoing';
    else {
        const accepted = await prisma.jobApplication.count({ where: { jobId: id, status: 'accepted' } });
        status = accepted >= job.workerQuota ? 'full' : 'open';
    }
    return { ...job, status };
}
async function create(userId, data) {
    const employer = await prisma.employerProfile.findUnique({ where: { userId } });
    if (!employer)
        throw httpError(403, 'Employer profile required');
    const title = typeof data.title === 'string' ? data.title.trim() : '';
    const location = typeof data.location === 'string' ? data.location.trim() : '';
    const description = typeof data.description === 'string' ? data.description : '';
    if (!title)
        throw httpError(400, 'title is required');
    if (!location)
        throw httpError(400, 'location is required');
    const startDate = new Date(data.startDate);
    if (!data.startDate || isNaN(startDate.getTime()))
        throw httpError(400, 'startDate is invalid');
    let durationDays = Number(data.durationDays);
    let workerQuota = Number(data.workerQuota);
    if (!Number.isFinite(durationDays) || durationDays < 1)
        durationDays = 1;
    if (!Number.isFinite(workerQuota) || workerQuota < 1)
        workerQuota = 1;
    return prisma.job.create({
        data: {
            employerId: employer.id,
            title,
            description,
            location,
            startDate,
            durationDays,
            workerQuota,
            type: normalizeType(data.type),
            status: 'open',
        },
    });
}
function normalizeType(t) {
    const s = String(t || '').toLowerCase().trim();
    switch (s) {
        case 'physical work':
        case 'physical_work':
            return 'physical_work';
        case 'fnb':
            return 'fnb';
        case 'event':
            return 'event';
        case 'retail':
            return 'retail';
        default:
            return 'others';
    }
}
async function update(userId, id, data) {
    const job = await prisma.job.findUnique({ where: { id } });
    const employer = await prisma.employerProfile.findUnique({ where: { userId } });
    if (!job || !employer || job.employerId !== employer.id)
        throw httpError(403, 'Forbidden');
    const allowed = {};
    ['title', 'description', 'location'].forEach((k) => {
        if (typeof data[k] === 'string')
            allowed[k] = data[k];
    });
    if (data.startDate) {
        const d = new Date(data.startDate);
        if (isNaN(d.getTime()))
            throw httpError(400, 'startDate is invalid');
        allowed.startDate = d;
    }
    if (data.durationDays) {
        const n = Number(data.durationDays);
        if (!Number.isFinite(n) || n < 1)
            throw httpError(400, 'durationDays must be >= 1');
        allowed.durationDays = n;
    }
    if (data.workerQuota) {
        const n = Number(data.workerQuota);
        if (!Number.isFinite(n) || n < 1)
            throw httpError(400, 'workerQuota must be >= 1');
        allowed.workerQuota = n;
    }
    return prisma.job.update({ where: { id }, data: allowed });
}
async function remove(userId, id) {
    const job = await prisma.job.findUnique({ where: { id } });
    const employer = await prisma.employerProfile.findUnique({ where: { userId } });
    if (!job || !employer || job.employerId !== employer.id)
        throw httpError(403, 'Forbidden');
    await prisma.job.delete({ where: { id } });
    return { success: true };
}
async function addSession(userId, jobId, data) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    const employer = await prisma.employerProfile.findUnique({ where: { userId } });
    if (!job || !employer || job.employerId !== employer.id)
        throw httpError(403, 'Forbidden');
    const sessionDate = new Date(data.sessionDate);
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    if (isNaN(sessionDate.getTime()))
        throw httpError(400, 'sessionDate is invalid');
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime()))
        throw httpError(400, 'startTime/endTime are invalid');
    if (startTime >= endTime)
        throw httpError(400, 'startTime must be before endTime');
    return prisma.jobSession.create({
        data: {
            jobId,
            sessionDate,
            startTime,
            endTime,
        },
    });
}
function sessions(jobId) {
    return prisma.jobSession.findMany({ where: { jobId } });
}
async function addSkills(userId, jobId, body) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    const employer = await prisma.employerProfile.findUnique({ where: { userId } });
    if (!job || !employer || job.employerId !== employer.id)
        throw httpError(403, 'Forbidden');
    const skills = Array.isArray(body.skills) ? body.skills : [];
    const clean = skills.map((s) => String(s).trim()).filter(Boolean);
    if (clean.length === 0)
        throw httpError(400, 'skills must be a non-empty array');
    await prisma.jobRequiredSkill.createMany({ data: clean.map((s) => ({ jobId, skillName: s })) });
    return { success: true };
}
module.exports = { list, detail, create, update, remove, addSession, sessions, addSkills };
//# sourceMappingURL=Jobs.js.map