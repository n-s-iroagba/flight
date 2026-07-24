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
exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const env_1 = require("../config/env");
const models_1 = require("../models");
class AuthService {
    login(email, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield models_1.AdminUser.findOne({ where: { email } });
            if (!user)
                throw new Error('Invalid credentials');
            const isValid = yield bcrypt_1.default.compare(password, user.password_hash);
            if (!isValid)
                throw new Error('Invalid credentials');
            const token = jsonwebtoken_1.default.sign({ id: user.id, role: user.role, email: user.email }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_EXPIRATION });
            yield user.update({ last_login: new Date() });
            return {
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    fullName: user.full_name,
                    role: user.role,
                }
            };
        });
    }
}
exports.AuthService = AuthService;
exports.default = new AuthService();
