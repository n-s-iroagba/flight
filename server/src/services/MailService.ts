import nodemailer from 'nodemailer';

interface SendMailPayload {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const host = process.env.SMTP_HOST || 'mail.swiftwings.online';
    const port = Number(process.env.SMTP_PORT) || 465;
    const secure = process.env.SMTP_SECURE === 'false' ? false : true;
    const user = process.env.SMTP_USER || 'booking@swiftwings.online';
    const pass = process.env.SMTP_PASS || 'Daniel123@';

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  async sendMail({ to, subject, text, html }: SendMailPayload) {
    const from = process.env.SMTP_FROM || 'Swift Wings Support <booking@swiftwings.online>';

    const mailOptions = {
      from,
      to,
      subject,
      text: text || (html ? html.replace(/<[^>]+>/g, '') : ''),
      html: html || `<p>${text}</p>`,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId, response: info.response };
    } catch (error: any) {
      console.error('MailService sendMail Error:', error);
      throw new Error(`Failed to send email via booking@swiftwings.online: ${error.message}`);
    }
  }
}

export default new MailService();
