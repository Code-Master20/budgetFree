const resend = require("../config/resend");

exports.sendEmail = async (to, subject, html) => {
  try {
    console.log("📧 Sending email to:", to);

    const response = await resend.emails.send({
      from: "YourApp <onboarding@resend.dev>", // 👈 IMPORTANT CHANGE
      to: [to], // 👈 TEMP TEST EMAIL
      subject,
      html,
    });

    console.log("✅ Email response:", response);
  } catch (error) {
    console.log("❌ Email failed:", error);
  }
};
