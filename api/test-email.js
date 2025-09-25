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

export default async function handler(req, res) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
  };

  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
    res.setHeader('Access-Control-Allow-Headers', corsHeaders['Access-Control-Allow-Headers']);
    res.setHeader('Access-Control-Allow-Methods', corsHeaders['Access-Control-Allow-Methods']);
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  try {
    const { to } = req.body || {};
    if (!to) {
      res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
      return res.status(400).json({ ok: false, error: 'Missing "to"' });
    }
    const from = process.env.FROM_EMAIL || 'no-reply@example.com';
    const provider = (process.env.EMAIL_PROVIDER || '').toLowerCase();
    if (!process.env.FROM_EMAIL) {
      res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
      return res.status(500).json({ ok: false, error: 'FROM_EMAIL not set in environment' });
    }
    if (provider !== 'smtp' && !process.env.RESEND_API_KEY) {
      res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
      return res.status(500).json({ ok: false, error: 'RESEND_API_KEY not set in environment' });
    }

    const r = await sendEmail({ from, to: [to], subject: 'Test email from Day Camp app', text: 'It works!', html: '<p>It works! 🎉</p>' });
    if (r.error) throw new Error(JSON.stringify(r.error));

    res.setHeader('Access-Control-Allow-Origin', corsHeaders['Access-Control-Allow-Origin']);
    return res.status(200).json({ ok: true, id: r.data?.id });
  } catch (err) {
    console.error('test-email error', err);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({ ok: false, error: err?.message || 'unknown error' });
  }
}
