import { BrevoClient } from '@getbrevo/brevo';

export interface EmailPayload {
    to: string;
    subject: string;
    html: string;
}

export class EmailService {
    private brevo: BrevoClient;
    private from: string;

    constructor() {
        this.brevo = new BrevoClient({
            apiKey: process.env.BREVO_API_KEY!,
        });

        this.from = process.env.EMAIL_FROM!;
    }

    async sendEmail({
        to,
        subject,
        html,
    }: EmailPayload): Promise<void> {
        await this.brevo.transactionalEmails.sendTransacEmail({
            sender: {
                name: 'PayVi',
                email: this.from,
            },
            to: [
                {
                    email: to,
                },
            ],
            subject,
            htmlContent: html,
        });
        // await this.brevo.transactionalEmails.sendTransacEmail({
        //     sender: {
        //         email: this.from,
        //     },
        //     to: [
        //         {
        //             email: to,
        //         },
        //     ],
        //     subject,
        //     htmlContent: html,
        // });
    }
}

export default new EmailService();
