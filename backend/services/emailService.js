const { getResendClient } = require("../config/resend");

exports.sendEmail = async (to, subject, html) => {
  try {
    const resend = getResendClient();

    const response = await resend.emails.send({
      from: "YourApp <onboarding@resend.dev>",
      to: [to],
      subject,
      html,
    });

    console.log("Email response:", response);
  } catch (error) {
    console.log("Email failed:", error);
    throw error;
  }
};
