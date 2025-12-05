"use strict";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function list(query) {
    const where = {};
    if (query && query.location)
        where.location = { contains: query.location };
    return prisma.job.findMany({ where, include: { sessions: true, skills: true, employer: true } });
}
function detail(id) {
    return prisma.job.findUnique({ where: { id }, include: { sessions: true, skills: true, employer: true } });
}
async function create(userId, data) {
    const employer = await prisma.employerProfile.findUnique({ where: { userId } });
    if (!employer)
        throw new Error('Employer profile required');
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
    });
}
async function update(userId, id, data) {
    const job = await prisma.job.findUnique({ where: { id } });
    const employer = await prisma.employerProfile.findUnique({ where: { userId } });
    if (!job || !employer || job.employerId !== employer.id)
        throw new Error('Forbidden');
    const allowed = {};
    ['title', 'description', 'location'].forEach((k) => {
        if (typeof data[k] === 'string')
            allowed[k] = data[k];
    });
    if (data.startDate)
        allowed.startDate = new Date(data.startDate);
    if (data.durationDays)
        allowed.durationDays = Number(data.durationDays);
    if (data.workerQuota)
        allowed.workerQuota = Number(data.workerQuota);
    return prisma.job.update({ where: { id }, data: allowed });
}
async function remove(userId, id) {
    const job = await prisma.job.findUnique({ where: { id } });
    const employer = await prisma.employerProfile.findUnique({ where: { userId } });
    if (!job || !employer || job.employerId !== employer.id)
        throw new Error('Forbidden');
    await prisma.job.delete({ where: { id } });
    return { success: true };
}
async function addSession(userId, jobId, data) {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    const employer = await prisma.employerProfile.findUnique({ where: { userId } });
    if (!job || !employer || job.employerId !== employer.id)
        throw new Error('Forbidden');
    return prisma.jobSession.create({
        data: {
            jobId,
            sessionDate: new Date(data.sessionDate),
            startTime: new Date(data.startTime),
            endTime: new Date(data.endTime),
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
        throw new Error('Forbidden');
    const skills = Array.isArray(body.skills) ? body.skills : [];
    await prisma.jobRequiredSkill.createMany({ data: skills.map((s) => ({ jobId, skillName: s })) });
    return { success: true };
}
module.exports = { list, detail, create, update, remove, addSession, sessions, addSkills };
//# sourceMappingURL=Jobs.js.map