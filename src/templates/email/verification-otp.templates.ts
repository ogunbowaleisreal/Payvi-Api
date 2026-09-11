import { emailLayout } from "./layout/email.layout.js";

export const verificationOtpTemplate = (otp: string) => ({
    subject: "Verify your email address",

    html: emailLayout({
        title: "Verify your email address",

        content: `
      <h1
        style="
          margin-top: 0;
          font-size: 24px;
        "
      >
        Verify your email
      </h1>

      <p>
        Use the verification code below to verify your email address.
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
            color: #18181b;
          "
        >
          ${otp}
        </span>
      </div>

      <p>
        This code will expire in 5 minutes.
      </p>

      <p>
        If you did not request this code, you can safely ignore this email.
      </p>
    `,
    }),
});