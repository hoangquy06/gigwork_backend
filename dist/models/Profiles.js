"use strict";
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
function createEmployee(userId, body) {
    var _a, _b, _c;
    return prisma.employeeProfile.create({
        data: {
            userId,
            bio: (_a = body.bio) !== null && _a !== void 0 ? _a : null,
            skills: (_b = body.skills) !== null && _b !== void 0 ? _b : null,
            dob: body.dob ? new Date(body.dob) : null,
            gender: (_c = body.gender) !== null && _c !== void 0 ? _c : null,
        },
    });
}
function updateEmployee(userId, body) {
    var _a, _b, _c;
    return prisma.employeeProfile.update({
        where: { userId },
        data: {
            bio: (_a = body.bio) !== null && _a !== void 0 ? _a : undefined,
            skills: (_b = body.skills) !== null && _b !== void 0 ? _b : undefined,
            dob: body.dob ? new Date(body.dob) : undefined,
            gender: (_c = body.gender) !== null && _c !== void 0 ? _c : undefined,
        },
    });
}
function createEmployer(userId, body) {
    var _a;
    return prisma.employerProfile.create({
        data: {
            userId,
            companyName: body.companyName,
            companyAddress: (_a = body.companyAddress) !== null && _a !== void 0 ? _a : null,
        },
    });
}
function updateEmployer(userId, body) {
    var _a, _b;
    return prisma.employerProfile.update({
        where: { userId },
        data: {
            companyName: (_a = body.companyName) !== null && _a !== void 0 ? _a : undefined,
            companyAddress: (_b = body.companyAddress) !== null && _b !== void 0 ? _b : undefined,
        },
    });
}
module.exports = { createEmployee, updateEmployee, createEmployer, updateEmployer };
//# sourceMappingURL=Profiles.js.map