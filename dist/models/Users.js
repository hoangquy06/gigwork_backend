"use strict";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function getById(id) {
    return prisma.user.findUnique({ where: { id }, include: { employee: true, employer: true } });
}
async function updateById(id, data) {
    const allowed = {};
    if (typeof data.phone === 'string')
        allowed.phone = data.phone;
    return prisma.user.update({ where: { id }, data: allowed });
}
module.exports = { getById, updateById };
//# sourceMappingURL=Users.js.map