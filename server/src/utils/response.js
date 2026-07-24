"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = exports.sendSuccess = void 0;
const sendSuccess = (res, data = null, message = '', metadata = undefined, statusCode = 200) => {
    const response = { success: true };
    if (data)
        response.data = data;
    if (message)
        response.message = message;
    if (metadata)
        response.metadata = metadata;
    return res.status(statusCode).json(response);
};
exports.sendSuccess = sendSuccess;
const sendError = (res, message, code = 'INTERNAL_ERROR', details = null, statusCode = 500) => {
    var _a;
    const errorObj = {
        code,
        message,
        timestamp: new Date().toISOString(),
        requestId: ((_a = res.locals) === null || _a === void 0 ? void 0 : _a.requestId) || 'unknown',
    };
    if (details)
        errorObj.details = details;
    return res.status(statusCode).json({
        success: false,
        error: errorObj,
    });
};
exports.sendError = sendError;
