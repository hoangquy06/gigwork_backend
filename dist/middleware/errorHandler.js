"use strict";
function errorHandler(err, req, res, next) {
    const code = err && err.code ? err.code : 400;
    const message = err && err.message ? err.message : 'Bad Request';
    return res.status(code >= 100 && code < 600 ? code : 400).json({ error: message, code });
}
module.exports = { errorHandler };
//# sourceMappingURL=errorHandler.js.map