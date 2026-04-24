const { getResendClient } = require("../config/resend");

const resolveFromAddress = () => {
  const configuredFromAddress = process.env.EMAIL_FROM?.trim();

  if (configuredFromAddress) {
    return configuredFromAddress;
  }

  const siteUrl = process.env.FRONTEND_URL?.trim() || process.env.BASE_URL?.trim();

  if (siteUrl) {
    try {
      const host = new URL(siteUrl).hostname.replace(/^www\./, "");

      if (!["localhost", "127.0.0.1"].includes(host) && host.includes(".")) {
        return `BudgetFree <noreply@${host}>`;
      }
    } catch (error) {
      console.log("Unable to derive email sender from site URL:", error.message);
    }
  }

  return "BudgetFree <onboarding@resend.dev>";
};

exports.sendEmail = async (to, subject, html) => {
  try {
    const resend = getResendClient();
    const response = await resend.emails.send({
      from: resolveFromAddress(),
      to: [to],
      subject,
      html,
      replyTo: process.env.ADMIN_EMAIL?.trim() || undefined,
    });

    if (response?.error) {
      throw new Error(response.error.message || "Email delivery failed");
    }

    console.log("Email response:", response);
    return response?.data;
  } catch (error) {
    console.log("Email failed:", error);
    throw error;
  }
};
