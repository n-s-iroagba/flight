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
exports.PaymentController = void 0;
const zod_1 = require("zod");
const PaymentService_1 = __importDefault(require("../services/PaymentService"));
const response_1 = require("../utils/response");
class PaymentController {
    list(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const statusParam = req.query.status;
                const statuses = statusParam ? statusParam.split(',') : undefined;
                const payments = yield PaymentService_1.default.getPayments(statuses);
                const summary = {
                    pending: payments.filter(p => p.status === 'pending').length,
                    processing: payments.filter(p => p.status === 'processing').length,
                    paid: payments.filter(p => p.status === 'paid').length,
                    failed: payments.filter(p => p.status === 'failed').length,
                    totalRevenue: payments.filter(p => p.status === 'paid').reduce((acc, curr) => acc + Number(curr.amount), 0),
                    currency: 'USD'
                };
                return (0, response_1.sendSuccess)(res, { payments, total: payments.length, summary });
            }
            catch (error) {
                return (0, response_1.sendError)(res, error.message);
            }
        });
    }
    markPaid(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params; // booking id
                const schema = zod_1.z.object({
                    paymentConfirmation: zod_1.z.object({
                        method: zod_1.z.enum(['cash', 'bank_transfer', 'mobile_money', 'whatsapp']),
                        reference: zod_1.z.string().optional(),
                        notes: zod_1.z.string().optional(),
                        amount: zod_1.z.number().positive(),
                        currency: zod_1.z.string().default('USD')
                    })
                });
                const parsed = schema.safeParse(req.body);
                if (!parsed.success) {
                    return (0, response_1.sendError)(res, 'Validation failed', 'BAD_REQUEST', parsed.error.format(), 400);
                }
                // @ts-ignore - using user from auth middleware
                const confirmedBy = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.email) || 'admin';
                const result = yield PaymentService_1.default.markPaid(id, Object.assign(Object.assign({}, parsed.data.paymentConfirmation), { confirmedBy }));
                return (0, response_1.sendSuccess)(res, result, 'Payment confirmed successfully');
            }
            catch (error) {
                return (0, response_1.sendError)(res, error.message);
            }
        });
    }
    confirmDelivery(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { id } = req.params; // booking id
                const schema = zod_1.z.object({
                    confirmationCode: zod_1.z.string(),
                    deliveredTo: zod_1.z.string()
                });
                const parsed = schema.safeParse(req.body);
                if (!parsed.success) {
                    return (0, response_1.sendError)(res, 'Validation failed', 'BAD_REQUEST', parsed.error.format(), 400);
                }
                // @ts-ignore - using user from auth middleware
                const confirmedBy = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.email) || 'admin';
                const result = yield PaymentService_1.default.confirmTicketDelivery(id, Object.assign(Object.assign({}, parsed.data), { confirmedBy }));
                return (0, response_1.sendSuccess)(res, result, 'Ticket delivery confirmed');
            }
            catch (error) {
                return (0, response_1.sendError)(res, error.message);
            }
        });
    }
    sendTicketWhatsapp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const schema = zod_1.z.object({
                    message: zod_1.z.string(),
                    includeETicket: zod_1.z.boolean()
                });
                const parsed = schema.safeParse(req.body);
                if (!parsed.success) {
                    return (0, response_1.sendError)(res, 'Validation failed', 'BAD_REQUEST', parsed.error.format(), 400);
                }
                const result = yield PaymentService_1.default.sendTicketWhatsapp(id, parsed.data);
                return (0, response_1.sendSuccess)(res, result);
            }
            catch (error) {
                return (0, response_1.sendError)(res, error.message);
            }
        });
    }
    sendTicketEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const schema = zod_1.z.object({
                    subject: zod_1.z.string(),
                    message: zod_1.z.string(),
                    includeETicket: zod_1.z.boolean()
                });
                const parsed = schema.safeParse(req.body);
                if (!parsed.success) {
                    return (0, response_1.sendError)(res, 'Validation failed', 'BAD_REQUEST', parsed.error.format(), 400);
                }
                const result = yield PaymentService_1.default.sendTicketEmail(id, parsed.data);
                return (0, response_1.sendSuccess)(res, result);
            }
            catch (error) {
                return (0, response_1.sendError)(res, error.message);
            }
        });
    }
}
exports.PaymentController = PaymentController;
exports.default = new PaymentController();
