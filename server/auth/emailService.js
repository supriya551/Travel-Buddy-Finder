import nodemailer from 'nodemailer';
import AppError from './AppError.js';

export async function sendOtp(email, code) {
  if (process.env.DEV_MODE === 'true') {
    console.log(`\n[DEV_MODE] OTP for ${email}: ${code}\n`);
    return;
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    throw new AppError('Failed to send verification email.', 500);
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: false,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });

  try {
    await transporter.sendMail({
      from: `"TravelBuddy" <${SMTP_USER}>`,
      to: email,
      subject: 'Your TravelBuddy verification code',
      text: `Your verification code is: ${code}\n\nThis code expires in 10 minutes.`,
      html: `
        <div style="font-family:sans-serif;max-width:400px;margin:auto">
          <h2>Verify your email</h2>
          <p>Enter this code to complete your TravelBuddy signup:</p>
          <div style="font-size:2rem;font-weight:bold;letter-spacing:0.3em;padding:1rem;background:#f4f4f4;border-radius:8px;text-align:center">
            ${code}
          </div>
          <p style="color:#888;font-size:0.85rem;margin-top:1rem">
            This code expires in 10 minutes. If you didn't request this, ignore this email.
          </p>
        </div>
      `,
    });
  } catch (err) {
    console.error('Email send error:', err.message);
    throw new AppError('Failed to send verification email.', 500);
  }
}
