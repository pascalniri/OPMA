import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "465"),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  try {
    const info = await transporter.sendMail({
      from: `"Akazi Space" <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
    });
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

export function generateInvitationEmail(orgName: string, token: string) {
  const url = `${process.env.NEXT_PUBLIC_APP_URL}/invite?token=${token}`;
  
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded: 8px;">
      <h2 style="color: #111827; margin-bottom: 16px;">You've been invited to join ${orgName}</h2>
      <p style="color: #4b5563; font-size: 16px; line-height: 24px; margin-bottom: 24px;">
        You've been invited to collaborate on projects in <strong>${orgName}</strong> on Akazi Space.
      </p>
      <a href="${url}" style="display: inline-block; background-color: #111827; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
        Accept Invitation
      </a>
      <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
        This invitation link will expire in 7 days. If you weren't expecting this invitation, you can safely ignore this email.
      </p>
    </div>
  `;
}
