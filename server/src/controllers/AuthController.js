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
exports.AuthController = void 0;
const zod_1 = require("zod");
const AuthService_1 = __importDefault(require("../services/AuthService"));
const response_1 = require("../utils/response");
class AuthController {
    login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const schema = zod_1.z.object({
                    email: zod_1.z.string().email(),
                    password: zod_1.z.string().min(6),
                });
                const parsed = schema.safeParse(req.body);
                if (!parsed.success) {
                    return (0, response_1.sendError)(res, 'Validation failed', 'BAD_REQUEST', parsed.error.format(), 400);
                }
                const result = yield AuthService_1.default.login(parsed.data.email, parsed.data.password);
                return (0, response_1.sendSuccess)(res, result, 'Login successful');
            }
            catch (error) {
                return (0, response_1.sendError)(res, error.message, 'UNAUTHORIZED', null, 401);
            }
        });
    }
}
exports.AuthController = AuthController;
exports.default = new AuthController();
