import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter?: nodemailer.Transporter;

  constructor(private readonly config: ConfigService) {}

  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) return this.transporter;
    const host = this.config.get<string>('SMTP_HOST');
    const port = parseInt(this.config.get<string>('SMTP_PORT', '587'));
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    if (!host || !user || !pass) {
      const account = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: { user: account.user, pass: account.pass },
      });
      return this.transporter;
    }
    this.transporter = nodemailer.createTransport({
      host,
      port,
      auth: { user, pass },
    });
    return this.transporter;
  }

  async sendVerificationEmail(to: string, link: string) {
    const transporter = await this.getTransporter();
    const from = this.config.get<string>('MAIL_FROM') || 'no-reply@example.com';
    const subject = 'Xác minh địa chỉ email';
    const html = `
      <p>Chào bạn,</p>
      <p>Vui lòng nhấn vào liên kết sau để xác minh email của bạn:</p>
      <p><a href="${link}">Xác minh email</a></p>
      <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
    `;
    await transporter.sendMail({ from, to, subject, html });
  }
}
