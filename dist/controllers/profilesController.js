"use strict";
const Profiles = require('../models/Profiles');
function createEmployee(req, res) {
    return Profiles.createEmployee(req.user.id, req.body || {})
        .then((data) => res.status(201).location('/api/profiles/employee').json(data));
}
function updateEmployee(req, res) {
    return Profiles.updateEmployee(req.user.id, req.body || {})
        .then((data) => res.status(200).json(data));
}
function createEmployer(req, res) {
    return Profiles.createEmployer(req.user.id, req.body || {})
        .then((data) => res.status(201).location('/api/profiles/employer').json(data));
}
function updateEmployer(req, res) {
    return Profiles.updateEmployer(req.user.id, req.body || {})
        .then((data) => res.status(200).json(data));
}
module.exports = { createEmployee, updateEmployee, createEmployer, updateEmployer };
//# sourceMappingURL=profilesController.js.map