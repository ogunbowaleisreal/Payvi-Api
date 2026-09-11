import { Resend } from "resend";

export interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

export class EmailService {
    private resend: Resend;
    private from: string;

    constructor() {
        this.resend = new Resend(process.env.RESEND_API_KEY);
        this.from = process.env.EMAIL_FROM!;
    }

    async sendEmail({
        to,
        subject,
        html,
    }: EmailPayload): Promise<void> {
        await this.resend.emails.send({
            from: this.from,
            to,
            subject,
            html,
        });
    }

}