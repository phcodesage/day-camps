import { Resend } from 'resend';
import nodemailer from 'nodemailer';

// Simple CORS wrapper for Netlify functions
const corsify = (handler) => async (event, context) => {
  const res = await handler(event, context);
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST,OPTIONS'
  };
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  return { ...res, headers: { ...(res.headers || {}), ...headers } };
};

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

export const handler = corsify(async (event) => {
  try {
    if (event.httpMethod !== 'POST') {
      return { statusCode: 405, body: JSON.stringify({ ok: false, error: 'Method not allowed' }) };
    }

    const body = JSON.parse(event.body || '{}');
    const { form = {}, pricing = {}, pricingInput = {}, payment = {} } = body;

    const from = process.env.FROM_EMAIL || 'no-reply@example.com';
    const adminRecipients = [
      'Info@exceedlearningcenterny.com',
      'olganyc21@gmail.com',
      'phcodesage@gmail.com',
    ];

    const subject = `New Day Camp Registration - ${form?.parentInfo?.name || 'Parent'}`;

    const lines = [
      `Parent: ${form?.parentInfo?.name || ''}`,
      `Email: ${form?.parentInfo?.email || ''}`,
      `Phone: ${form?.parentInfo?.phone || ''}`,
      `Emergency: ${form?.parentInfo?.emergencyContact || ''} - ${form?.parentInfo?.emergencyPhone || ''}`,
      '',
      `Children count: ${(form?.children || []).length}`,
      ...(form?.children || []).map((c, i) => `Child ${i + 1}: ${c.name} | ${c.campType} | ${c.selectedDates?.length || 0} day(s)`),
      '',
      `Days selected (unique): ${pricing?.daysCount ?? pricingInput?.daysCount ?? ''}`,
      `Estimated total: $${pricing?.totalCost?.toFixed?.(2) ?? ''}`,
      '',
      `Payment method: ${form?.payment?.method || 'Not specified'}`,
      ...(form?.payment?.method === 'credit-card' ? [
        `Cardholder: ${form?.payment?.details?.cardholderName || ''}`,
        `Card Last 4: ${form?.payment?.details?.last4 || ''}`,
        `Billing ZIP: ${form?.payment?.details?.zip || ''}`,
      ] : []),
      `Notes: ${form?.additionalInfo?.specialRequests || 'None'}`,
    ];

    const text = lines.join('\n');
    const html = `<pre style="font: 14px/1.5 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace; white-space: pre-wrap;">${
      lines.map(l => String(l).replace(/&/g, '&amp;').replace(/</g, '&lt;')).join('\n')
    }</pre>`;

    if (!process.env.FROM_EMAIL) {
      return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'FROM_EMAIL not set in environment' }) };
    }
    const provider = (process.env.EMAIL_PROVIDER || '').toLowerCase();
    if (provider !== 'smtp' && !process.env.RESEND_API_KEY) {
      return { statusCode: 500, body: JSON.stringify({ ok: false, error: 'RESEND_API_KEY not set in environment' }) };
    }

    const adminSend = await sendEmail({ from, to: adminRecipients, subject, text, html });
    if (adminSend.error) throw new Error(JSON.stringify(adminSend.error));

    // optional confirmation to parent
    const parentEmail = form?.parentInfo?.email;
    if (parentEmail) {
      const clientText = 'Thank you for registering! We have received your submission.';
      const clientHtml = `<p>Thank you for registering! We have received your submission.</p>`;
      await sendEmail({ from, to: [parentEmail], subject: 'We received your registration', text: clientText, html: clientHtml });
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.error('send-email error', err);
    return { statusCode: 500, body: JSON.stringify({ ok: false, error: err?.message || 'unknown error' }) };
  }
});
