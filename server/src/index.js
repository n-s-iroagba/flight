"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const database_1 = __importDefault(require("./config/database"));
const logger_1 = __importDefault(require("./config/logger"));
// Test DB Connection and sync models
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield database_1.default.authenticate();
        logger_1.default.info('Database connection established successfully.');
        // Sync models (in production, prefer migrations)
        if (env_1.env.NODE_ENV === 'development') {
            yield database_1.default.sync({ alter: true });
            logger_1.default.info('Database models synchronized with alter: true.');
        }
        const port = env_1.env.PORT;
        app_1.default.listen(port, () => {
            logger_1.default.info(`Server is running on port ${port} in ${env_1.env.NODE_ENV} mode.`);
        });
    }
    catch (error) {
        logger_1.default.error('Unable to connect to the database:', error);
        process.exit(1);
    }
});
startServer();
