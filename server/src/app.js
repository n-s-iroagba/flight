"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const env_1 = require("./config/env");
const logger_1 = __importDefault(require("./config/logger"));
const routes_1 = __importDefault(require("./routes"));
const response_1 = require("./utils/response");
const app = (0, express_1.default)();
// Middlewares
const allowedOrigins = [
    'http://localhost:3000',
    'https://swiftwings.online',
    'https://www.swiftwings.online'
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1 || env_1.env.NODE_ENV !== 'production') {
            return callback(null, true);
        }
        return callback(new Error('CORS policy does not allow access from the specified Origin.'), false);
    },
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Request Logging Middleware
app.use((req, res, next) => {
    logger_1.default.info(`${req.method} ${req.url}`);
    next();
});
// Rate Limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(env_1.env.RATE_LIMIT_WINDOW, 10),
    max: parseInt(env_1.env.RATE_LIMIT_MAX_REQUESTS, 10),
    message: {
        success: false,
        error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests, please try again later.',
        }
    }
});
app.use('/api', limiter);
// API Routes
app.use('/api', routes_1.default);
// 404 Handler
app.use((req, res) => {
    (0, response_1.sendError)(res, 'Not Found', 'NOT_FOUND', null, 404);
});
// Global Error Handler
app.use((err, req, res, next) => {
    logger_1.default.error(err.stack);
    (0, response_1.sendError)(res, err.message, 'INTERNAL_ERROR', null, 500);
});
exports.default = app;
