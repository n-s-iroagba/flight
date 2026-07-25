import { Request, Response } from 'express';
import mailService from '../services/MailService';
import { z } from 'zod';

const sendMailSchema = z.object({
  to: z.string().email({ message: 'Invalid recipient email address' }),
  subject: z.string().min(1, { message: 'Subject is required' }),
  message: z.string().optional(),
  html: z.string().optional(),
});

export class MailController {
  async sendMail(req: Request, res: Response) {
    try {
      const validated = sendMailSchema.parse(req.body);
      const htmlContent = validated.html || validated.message || '';
      
      const result = await mailService.sendMail({
        to: validated.to,
        subject: validated.subject,
        text: validated.message,
        html: htmlContent,
      });

      return res.status(200).json({
        success: true,
        message: `Email successfully sent to ${validated.to} from booking@swiftwings.online`,
        data: result,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: error.errors[0].message });
      }
      return res.status(500).json({ success: false, error: error.message || 'Server error sending email' });
    }
  }
}

export default new MailController();
