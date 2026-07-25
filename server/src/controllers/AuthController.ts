import { Request, Response } from 'express';
import { z } from 'zod';
import authService from '../services/AuthService';
import { sendSuccess, sendError } from '../utils/response';

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const schema = z.object({
        username: z.string().min(1, 'Username is required'),
        password: z.string().min(1, 'Password is required'),
      });

      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return sendError(res, 'Validation failed', 'BAD_REQUEST', parsed.error.format(), 400);
      }

      const result = await authService.login(parsed.data.username, parsed.data.password);
      return sendSuccess(res, result, 'Login successful');
    } catch (error: any) {
      return sendError(res, error.message, 'UNAUTHORIZED', null, 401);
    }
  }
}

export default new AuthController();
