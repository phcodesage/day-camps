import { Resend } from 'resend';
import nodemailer from 'nodemailer';

let smtpTransporter = null;
function getSmtpTransporter() {
  if (smtpTransporter) return smtpTransporter;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465;
  if (!host || !user || !pass) {
    throw new Error('SMTP not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
  }
  smtpTransporter = nodemailer.createTransport({ host, port, secure, auth: { user, pass } });
  return smtpTransporter;
}

let resend = null;
function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error('RESEND_API_KEY is not set');
  if (!resend) resend = new Resend(apiKey);
  return resend;
}

async function sendEmail({ from, to, subject, text, html }) {
  const provider = (process.env.EMAIL_PROVIDER || '').toLowerCase();
  if (provider === 'smtp' || process.env.SMTP_HOST) {
    const transporter = getSmtpTransporter();
    const info = await transporter.sendMail({ from, to: to.join(','), subject, text, html });
    return { data: { id: info.messageId } };
  }
  const r = await getResend().emails.send({ from, to, subject, text, html });
  return r;
}

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
  };
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ ok: false, error: 'Method not allowed' }) };
  }
  try {
    const { to } = JSON.parse(event.body || '{}');
    if (!to) return { statusCode: 400, headers, body: JSON.stringify({ ok: false, error: 'Missing "to"' }) };
    const from = process.env.FROM_EMAIL || 'no-reply@example.com';
    const provider = (process.env.EMAIL_PROVIDER || '').toLowerCase();
    if (!process.env.FROM_EMAIL) {
      return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: 'FROM_EMAIL not set in environment' }) };
    }
    if (provider !== 'smtp' && !process.env.RESEND_API_KEY) {
      return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: 'RESEND_API_KEY not set in environment' }) };
    }
    const r = await sendEmail({ from, to: [to], subject: 'Test email from Day Camp app', text: 'It works!', html: '<p>It works! 🎉</p>' });
    if (r.error) throw new Error(JSON.stringify(r.error));
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true, id: r.data?.id }) };
  } catch (err) {
    console.error('test-email error', err);
    return { statusCode: 500, headers, body: JSON.stringify({ ok: false, error: err?.message || 'unknown error' }) };
  }
};
