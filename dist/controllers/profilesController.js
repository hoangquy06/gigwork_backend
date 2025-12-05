"use strict";
const Profiles = require('../models/Profiles');
function createEmployee(req, res) {
    return Profiles.createEmployee(req.user.id, req.body || {})
        .then((data) => res.json({ statusCode: 200, message: 'Operation successful', data }));
}
function updateEmployee(req, res) {
    return Profiles.updateEmployee(req.user.id, req.body || {})
        .then((data) => res.json({ statusCode: 200, message: 'Operation successful', data }));
}
function createEmployer(req, res) {
    return Profiles.createEmployer(req.user.id, req.body || {})
        .then((data) => res.json({ statusCode: 200, message: 'Operation successful', data }));
}
function updateEmployer(req, res) {
    return Profiles.updateEmployer(req.user.id, req.body || {})
        .then((data) => res.json({ statusCode: 200, message: 'Operation successful', data }));
}
module.exports = { createEmployee, updateEmployee, createEmployer, updateEmployer };
//# sourceMappingURL=profilesController.js.map