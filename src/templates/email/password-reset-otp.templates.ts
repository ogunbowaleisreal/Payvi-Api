import { emailLayout } from "./layout/email.layout.js";

export const passwordResetOtpTemplate = (otp: string) => ({
    subject: "Reset your password",

    html: emailLayout({
        title: "Password reset",

        content: `
      <h1
        style="
          margin-top: 0;
          font-size: 24px;
        "
      >
        Reset your password
      </h1>

      <p>
        We received a request to reset your password.
        Use the code below to continue.
      </p>

      <div
        style="
          margin: 32px 0;
          padding: 20px;
          background-color: #f4f4f5;
          border-radius: 8px;
          text-align: center;
        "
      >
        <span
          style="
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
          "
        >
          ${otp}
        </span>
      </div>

      <p>
        This code will expire in 5 minutes.
      </p>

      <p>
        If you did not request a password reset,
        you can safely ignore this email.
      </p>
    `,
    }),
});