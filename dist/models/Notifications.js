"use strict";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
function list(userId) {
    return prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
}
module.exports = { list };
//# sourceMappingURL=Notifications.js.map