const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function seedMocks(req, res) {
  const plainPassword = 'Password123!'
  const passwordHash = await bcrypt.hash(plainPassword, 10)
  const employers = [
    { email: 'employer1@gigwork.local', companyName: 'Gigwork Co. 1', companyAddress: '123 Test Street' },
    { email: 'employer2@gigwork.local', companyName: 'Gigwork Co. 2', companyAddress: '456 Sample Avenue' },
  ]
  const employees = [
    { email: 'employee1@gigwork.local', bio: 'Chăm chỉ, đúng giờ', gender: 'male', skills: { list: ['Phụ kho', 'Bán hàng'] } },
    { email: 'employee2@gigwork.local', bio: 'Nhiệt tình, giao tiếp tốt', gender: 'female', skills: { list: ['Sự kiện', 'Giao tiếp'] } },
  ]

  const employerUsers = []
  for (const e of employers) {
    let u = await prisma.user.findUnique({ where: { email: e.email } })
    if (!u) {
      u = await prisma.user.create({ data: { email: e.email, passwordHash, isEmployer: true, isWorker: false, isVerified: true } })
    }
    await prisma.employerProfile.upsert({ where: { userId: u.id }, update: { companyName: e.companyName, companyAddress: e.companyAddress }, create: { userId: u.id, companyName: e.companyName, companyAddress: e.companyAddress } })
    employerUsers.push(u)
  }

  const employeeUsers = []
  for (const e of employees) {
    let u = await prisma.user.findUnique({ where: { email: e.email } })
    if (!u) {
      u = await prisma.user.create({ data: { email: e.email, passwordHash, isEmployer: false, isWorker: true, isVerified: true } })
    }
    await prisma.employeeProfile.upsert({ where: { userId: u.id }, update: { bio: e.bio, skills: e.skills, gender: e.gender }, create: { userId: u.id, bio: e.bio, skills: e.skills, gender: e.gender } })
    employeeUsers.push(u)
  }

  const jobDefs = (owner) => [
    { title: 'Nhân viên sự kiện - A', description: 'Hỗ trợ setup và vận hành sự kiện', location: 'Hà Nội', startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), durationDays: 2, workerQuota: 2, type: 'event', salary: 350000, skills: ['Giao tiếp', 'Nâng hạ nhẹ'] },
    { title: 'Phụ kho - B', description: 'Sắp xếp hàng hóa kho', location: 'TP HCM', startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), durationDays: 1, workerQuota: 1, type: 'physical_work', salary: 400000, skills: ['Phụ kho', 'Sức khỏe tốt'] },
    { title: 'Bán hàng - C', description: 'Bán hàng tại quầy', location: 'Đà Nẵng', startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), durationDays: 1, workerQuota: 1, type: 'retail', salary: 300000, skills: ['Bán hàng', 'Giao tiếp'] },
  ]

  const allJobs = []
  for (const owner of employerUsers) {
    for (const def of jobDefs(owner)) {
      let job = await prisma.job.findFirst({ where: { employerId: owner.id, title: def.title } })
      if (!job) {
        job = await prisma.job.create({
          data: {
            employerId: owner.id,
            title: def.title,
            description: def.description,
            startDate: def.startDate,
            durationDays: def.durationDays,
            workerQuota: def.workerQuota,
            type: def.type,
            salary: def.salary,
            status: 'open',
            sessions: {
              create: [
                { sessionDate: def.startDate, startTime: new Date(def.startDate.getTime() + 9 * 60 * 60 * 1000), endTime: new Date(def.startDate.getTime() + 17 * 60 * 60 * 1000) },
                { sessionDate: new Date(def.startDate.getTime() + 24 * 60 * 60 * 1000), startTime: new Date(def.startDate.getTime() + 24 * 60 * 60 * 1000 + 9 * 60 * 60 * 1000), endTime: new Date(def.startDate.getTime() + 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000) },
              ],
            },
            skills: { create: def.skills.map((s) => ({ skillName: s })) },
          },
        })
        await prisma.jobLocation.create({ data: { jobId: job.id, province: 'HN', city: def.location, ward: null, address: 'Địa chỉ mẫu' } })
        await prisma.job.update({ where: { id: job.id }, data: { locationId: job.id } })
      }
      allJobs.push(job)
    }
  }

  const apps = []
  const [emp1, emp2] = employerUsers
  const [wrk1, wrk2] = employeeUsers
  const jobsByEmp1 = allJobs.filter((j) => j.employerId === emp1.id)
  const jobsByEmp2 = allJobs.filter((j) => j.employerId === emp2.id)

  const ensureApp = async (job, worker, statusPlan) => {
    let a = await prisma.jobApplication.findFirst({ where: { jobId: job.id, workerId: worker.id } })
    if (!a) a = await prisma.jobApplication.create({ data: { jobId: job.id, workerId: worker.id, status: 'pending' } })
    for (const s of statusPlan) {
      if (s === 'accepted') {
        a = await prisma.jobApplication.update({ where: { id: a.id }, data: { status: 'accepted' } })
        await prisma.notification.create({ data: { userId: worker.id, type: 'application.accepted', title: 'Application accepted', content: `Your application for "${job.title}" was accepted` } })
      }
      if (s === 'completed') {
        a = await prisma.jobApplication.update({ where: { id: a.id }, data: { status: 'completed', isComplete: true, isPaid: true } })
        await prisma.notification.create({ data: { userId: worker.id, type: 'application.completed', title: 'Job completed', content: `You completed job "${job.title}"` } })
        await prisma.review.upsert({ where: { jobId_reviewerId: { jobId: job.id, reviewerId: job.employerId } }, update: {}, create: { jobId: job.id, reviewerId: job.employerId, revieweeId: worker.id, rating: 5, comment: 'Làm việc rất tốt' } })
      }
      if (s === 'pending') {
        await prisma.notification.create({ data: { userId: job.employerId, type: 'application.pending', title: 'New application', content: `A worker applied to "${job.title}"` } })
      }
    }
    apps.push(a)
  }

  await ensureApp(jobsByEmp1[0], wrk1, ['pending'])
  await ensureApp(jobsByEmp1[1], wrk1, ['accepted'])
  await ensureApp(jobsByEmp1[2], wrk2, ['accepted', 'completed'])

  await ensureApp(jobsByEmp2[0], wrk2, ['pending'])
  await ensureApp(jobsByEmp2[1], wrk2, ['accepted'])
  await ensureApp(jobsByEmp2[2], wrk1, ['accepted', 'completed'])

  return res.status(201).json({
    employers: employerUsers.map((u, i) => ({ id: u.id, email: u.email, password: plainPassword, companyName: employers[i].companyName })),
    employees: employeeUsers.map((u, i) => ({ id: u.id, email: u.email, password: plainPassword, bio: employees[i].bio })),
    jobs: allJobs.map((j) => ({ id: j.id, title: j.title, employerId: j.employerId })),
    applications: apps.map((a) => ({ id: a.id, jobId: a.jobId, workerId: a.workerId, status: a.status, isComplete: a.isComplete, isPaid: a.isPaid })),
  })
}

async function getMocks(req, res) {
  const emails = ['employer1@gigwork.local', 'employer2@gigwork.local', 'employee1@gigwork.local', 'employee2@gigwork.local']
  const users = await prisma.user.findMany({ where: { email: { in: emails } }, include: { employer: true, employee: true } })
  const employerIds = users.filter((u) => u.isEmployer).map((u) => u.id)
  const jobs = await prisma.job.findMany({ where: { employerId: { in: employerIds } }, include: { sessions: true, skills: true, locationByJobId: true } })
  const jobIds = jobs.map((j) => j.id)
  const applications = await prisma.jobApplication.findMany({ where: { jobId: { in: jobIds } } })
  return res.status(200).json({
    users,
    jobs,
    applications,
    credentials: {
      employers: [{ email: 'employer1@gigwork.local', password: 'Password123!' }, { email: 'employer2@gigwork.local', password: 'Password123!' }],
      employees: [{ email: 'employee1@gigwork.local', password: 'Password123!' }, { email: 'employee2@gigwork.local', password: 'Password123!' }],
    },
  })
}

module.exports = { seedMocks, getMocks }
