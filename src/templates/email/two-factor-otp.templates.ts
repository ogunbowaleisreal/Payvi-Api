import { emailLayout } from "./layout/email.layout.js";

export const twoFactorOtpTemplate = (otp: string) => ({
    subject: "Your two-factor authentication code",

    html: emailLayout({
        title: "Two-factor authentication",

        content: `
      <h1
        style="
          margin-top: 0;
          font-size: 24px;
        "
      >
        Two-factor authentication
      </h1>

      <p>
        Someone is trying to sign in to your account.
        Use the code below to complete the sign-in.
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
        If you did not attempt to sign in, we recommend
        securing your account immediately.
      </p>
    `,
    }),
});