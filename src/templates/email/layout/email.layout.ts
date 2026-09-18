import { emailConfig } from "../../../config/email.js";

interface EmailLayoutOptions {
  title: string;
  content: string;
}


export const emailLayout = ({
  title,
  content,
}: EmailLayoutOptions): string => {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>${title}</title>
      </head>

      <body
        style="
          margin: 0;
          padding: 0;
          background-color: #f4f4f5;
          font-family: Arial, Helvetica, sans-serif;
          color: #18181b;
        "
      >
        <div
          style="
            width: 100%;
            padding: 40px 0;
          "
        >
          <div
            style="
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border-radius: 8px;
              overflow: hidden;
            "
          >

            <!-- Header -->
            <div
              style="
                padding: 24px;
                background-color: ${emailConfig.primaryColor};
                text-align: center;
              "
            >
              ${emailConfig.logoUrl
      ? `
                    <img
                      src="${emailConfig.logoUrl}"
                      alt="${emailConfig.companyName}"
                      style="
                        max-width: 160px;
                        max-height: 60px;
                      "
                    />
                  `
      : `
                    <h2
                      style="
                        margin: 0;
                        color: #ffffff;
                      "
                    >
                      ${emailConfig.companyName}
                    </h2>
                  `
    }
            </div>

            <!-- Content -->
            <div
              style="
                padding: 40px 32px;
              "
            >
              ${content}
            </div>

            <!-- Footer -->
            <div
              style="
                padding: 24px 32px;
                border-top: 1px solid #e4e4e7;
                text-align: center;
                font-size: 13px;
                color: #71717a;
              "
            >
              ${emailConfig.websiteUrl
      ? `
                    <p style="margin: 0 0 8px;">
                      <a
                        href="${emailConfig.websiteUrl}"
                        style="
                          color: ${emailConfig.primaryColor};
                          text-decoration: none;
                        "
                      >
                        ${emailConfig.companyName}
                      </a>
                    </p>
                  `
      : ""
    }

              ${emailConfig.supportEmail
      ? `
                    <p style="margin: 0;">
                      Need help?
                      <a
                        href="mailto:${emailConfig.supportEmail}"
                        style="
                          color: ${emailConfig.primaryColor};
                          text-decoration: none;
                        "
                      >
                        Contact support
                      </a>
                    </p>
                  `
      : ""
    }
            </div>

          </div>
        </div>
      </body>
    </html>
  `;
};