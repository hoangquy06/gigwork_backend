const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

function getEmployeeById(userId) {
  return prisma.employeeProfile.findUnique({ where: { userId } })
}

function getEmployerById(userId) {
  return prisma.employerProfile.findUnique({ where: { userId } })
}

function createEmployee(userId, body) {
  return prisma.employeeProfile.create({
    data: {
      userId,
      bio: body.bio ?? null,
      skills: body.skills ?? null,
      dob: body.dob ? new Date(body.dob) : null,
      gender: body.gender ?? null,
    },
  })
}

function updateEmployee(userId, body) {
  return prisma.employeeProfile.update({
    where: { userId },
    data: {
      bio: body.bio ?? undefined,
      skills: body.skills ?? undefined,
      dob: body.dob ? new Date(body.dob) : undefined,
      gender: body.gender ?? undefined,
    },
  })
}

function createEmployer(userId, body) {
  return prisma.employerProfile.create({
    data: {
      userId,
      companyName: body.companyName,
      companyAddress: body.companyAddress ?? null,
    },
  })
}

function updateEmployer(userId, body) {
  return prisma.employerProfile.update({
    where: { userId },
    data: {
      companyName: body.companyName ?? undefined,
      companyAddress: body.companyAddress ?? undefined,
    },
  })
}

module.exports = { createEmployee, updateEmployee, createEmployer, updateEmployer }
