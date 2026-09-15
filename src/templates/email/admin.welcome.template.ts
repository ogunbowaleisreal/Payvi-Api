import { emailLayout } from "./layout/email.layout.js";

export const adminWelcomeTemplate = (
    firstName: string,
    email: string,
    password: string,
    roleName: string
) => ({
    subject: "Welcome to the Admin Portal",
    html: emailLayout({
        title: "Welcome to the Admin Portal",
        content: `
            <h1
                style="
                    margin-top: 0;
                    font-size: 24px;
                "
            >
                Welcome, ${firstName}
            </h1>

            <p>
                Your administrator account has been created successfully.
            </p>

            <p>
                You can now access the admin portal using the credentials
                below.
            </p>

            <div
                style="
                    margin: 32px 0;
                    padding: 20px;
                    background-color: #f4f4f5;
                    border-radius: 8px;
                "
            >
                <p style="margin: 0 0 12px 0;">
                    <strong>Email:</strong> ${email}
                </p>

                <p style="margin: 0 0 12px 0;">
                    <strong>Temporary Password:</strong> ${password}
                </p>

                <p style="margin: 0;">
                    <strong>Role:</strong> ${roleName}
                </p>
            </div>

            <p>
                Please log in and change your password as soon as possible.
            </p>

            <p>
                If you did not expect this account to be created,
                please contact the system administrator immediately.
            </p>
        `,
    }),
});