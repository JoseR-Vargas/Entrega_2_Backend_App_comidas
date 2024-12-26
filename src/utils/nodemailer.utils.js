import { createTransport } from "nodemailer";
const { GOOGLE_EMAIL , GOOGLE_PASS } = process.env

const transport = createTransport ({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: { user: GOOGLE_EMAIL, pass: GOOGLE_PASS }
});

const sendVerifyEmail = async ({ to, verifyCode}) => {
    try {
        await transport.verify();
        await transport.sendMail({ 
            from: GOOGLE_EMAIL,
            to,
            subject: "verify your coder account",
            html:
            `
  <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #28a745; color: #fff; text-align: center; padding: 20px;">
      <h1 style="margin: 0; font-size: 24px;">Welcome to Eats</h1>
    </div>
    <div style="padding: 20px;">
      <p style="font-size: 16px; line-height: 1.5; margin: 10px 0;">Thank you for joining us! We're excited to have you on board.</p>
      <p style="font-size: 16px; line-height: 1.5; margin: 10px 0;">Your verification code is:</p>
      <div style="font-size: 20px; font-weight: bold; color: #28a745; text-align: center; margin: 20px 0;">${verifyCode}</div>
      <p style="font-size: 14px; line-height: 1.5; margin: 10px 0; color: #666;">If you did not request this code, please ignore this email.</p>
    </div>
    <div style="background-color: #f1f1f1; text-align: center; padding: 10px; font-size: 14px; color: #888;">
      &copy; 2024 Eats. All rights reserved.
    </div>
  </div>
`
        });
    } catch (error) {
        throw error
    }
};

export { sendVerifyEmail}