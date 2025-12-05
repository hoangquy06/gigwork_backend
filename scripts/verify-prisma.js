const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  const usersCount = await prisma.user.count()
  const employersCount = await prisma.employerProfile.count()
  const jobsCount = await prisma.job.count()

  const users = await prisma.user.findMany({ take: 5, orderBy: { id: 'desc' } })
  const employers = await prisma.employerProfile.findMany({ take: 5, orderBy: { id: 'desc' } })
  const jobs = await prisma.job.findMany({ take: 5, orderBy: { id: 'desc' }, include: { sessions: true, skills: true } })

  const out = {
    counts: { users: usersCount, employerProfiles: employersCount, jobs: jobsCount },
    samples: { users, employerProfiles: employers, jobs },
  }
  console.log(JSON.stringify(out, null, 2))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
