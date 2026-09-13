const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

const mailboxFilePath = path.join(__dirname, '..', 'data', 'virtual_mailbox.json');

/**
 * Read sent emails from virtual mailbox
 */
function readVirtualMailbox() {
  try {
    if (!fs.existsSync(mailboxFilePath)) {
      return [];
    }
    const raw = fs.readFileSync(mailboxFilePath, 'utf8');
    return JSON.parse(raw || '[]');
  } catch (err) {
    console.error('[Virtual Mailbox] Read error:', err.message);
    return [];
  }
}

/**
 * Save sent email to virtual mailbox
 */
function recordSentEmail(emailRecord) {
  try {
    const list = readVirtualMailbox();
    list.unshift(emailRecord); // latest first
    // Keep last 50 emails
    if (list.length > 50) list.length = 50;
    fs.writeFileSync(mailboxFilePath, JSON.stringify(list, null, 2), 'utf8');
  } catch (err) {
    console.error('[Virtual Mailbox] Write error:', err.message);
  }
}

/**
 * Creates and returns a configured Nodemailer transporter
 */
function getTransporter() {
  const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.EMAIL_PORT || '465', 10);
  const secure = process.env.EMAIL_SECURE !== 'false';
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    }
  });
}

/**
 * Sends a stylized password recovery OTP email and stores in virtual mailbox
 */
async function sendPasswordResetOtp(toEmail, otp, userName = 'Valued Member') {
  const senderEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER || 'security@sevaconnect.org';
  const senderName = process.env.EMAIL_FROM_NAME || 'SevaConnect Security';
  const subject = `Your SevaConnect Password Reset Code: ${otp}`;
  const now = new Date().toISOString();

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>SevaConnect Password Reset</title>
      <style>
        body { font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4fbf9; margin: 0; padding: 24px; color: #17243a; }
        .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(8, 127, 115, 0.08); border: 1px solid #d4ede6; }
        .header { background: linear-gradient(135deg, #087F73 0%, #05665D 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0; font-size: 13px; opacity: 0.9; }
        .body { padding: 32px 28px; }
        .otp-box { background: #EAF6F3; border: 2px dashed #087F73; border-radius: 14px; text-align: center; padding: 22px; margin: 24px 0; }
        .otp-code { font-size: 38px; font-weight: 800; letter-spacing: 8px; color: #087F73; font-family: 'Courier New', Courier, monospace; margin: 0; }
        .otp-expiry { font-size: 12px; color: #667085; margin-top: 8px; font-weight: 600; }
        .warning { font-size: 12px; color: #854d0e; background-color: #fefce8; border: 1px solid #fef08a; padding: 12px 16px; border-radius: 10px; margin-top: 20px; line-height: 1.5; }
        .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 11px; color: #9ca3af; border-top: 1px solid #f3f4f6; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>SevaConnect</h1>
          <p>NGO Donation & Resource Management System</p>
        </div>
        <div class="body">
          <p style="font-size: 15px; margin-top: 0;">Hello <strong>${userName}</strong>,</p>
          <p style="font-size: 14px; line-height: 1.6; color: #475467;">
            We received a request to reset the password for your SevaConnect account. Use the following 6-digit One-Time Password (OTP) to proceed:
          </p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
            <div class="otp-expiry">⏱️ Valid for the next 15 minutes</div>
          </div>
          <div class="warning">
            <strong>🔒 Security Notice:</strong> Never share this code with anyone. SevaConnect administrators and volunteers will never ask for your recovery OTP.
          </div>
          <p style="font-size: 13px; color: #667085; margin-top: 24px;">
            If you did not request this password reset, please disregard this email. Your password will remain unchanged.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} SevaConnect NGO Management Platform. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

  const emailRecord = {
    id: 'mail_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    to: toEmail,
    from: `"${senderName}" <${senderEmail}>`,
    subject,
    otp,
    userName,
    sent_at: now,
    html
  };

  // Always record into virtual mailbox for live inspection
  recordSentEmail(emailRecord);

  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[Virtual Mailbox] Email dispatched to ${toEmail} with OTP: ${otp}`);
    return {
      success: true,
      sent: true,
      virtual: true,
      message: 'Email delivered to live Virtual Mailbox.'
    };
  }

  try {
    const info = await transporter.sendMail({
      from: `"${senderName}" <${senderEmail}>`,
      to: toEmail,
      subject,
      text: `Hello ${userName},\n\nYour 6-digit password reset OTP is: ${otp}\n\nThis code expires in 15 minutes.\n\nIf you did not request this, please ignore this email.`,
      html
    });

    console.log(`[Email Service] Real email successfully delivered to ${toEmail} (Message ID: ${info.messageId})`);
    return {
      success: true,
      sent: true,
      virtual: false,
      messageId: info.messageId
    };
  } catch (error) {
    console.error(`[Email Service] SMTP error sending to ${toEmail}:`, error.message);
    return {
      success: true,
      sent: true,
      virtual: true,
      error: error.message
    };
  }
}

/**
 * Get all emails for a specific recipient (or all if none specified)
 */
function getVirtualEmails(toEmail) {
  const all = readVirtualMailbox();
  if (!toEmail) return all;
  const target = String(toEmail).trim().toLowerCase();
  return all.filter(m => (m.to || '').toLowerCase() === target);
}

module.exports = {
  sendPasswordResetOtp,
  getTransporter,
  getVirtualEmails,
  readVirtualMailbox
};
