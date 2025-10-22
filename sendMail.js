








const axios = require('axios');
require('dotenv').config({ path: require('path').join(process.cwd(), '.env.dev') });

const { TENANT_ID, CLIENT_ID, CLIENT_SECRET, ORGANIZER_EMAIL } = process.env;

if (!TENANT_ID || !CLIENT_ID || !CLIENT_SECRET || !ORGANIZER_EMAIL) {
  console.error('❌ Missing required environment variables in .env.dev');
  process.exit(1);
}

function isValidEmail(email) {
  return typeof email === 'string' && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

async function getAccessToken() {
  const tokenUrl = `https://login.microsoftonline.com/${TENANT_ID}/oauth2/v2.0/token`;
  const params = new URLSearchParams();
  params.append('client_id', CLIENT_ID);
  params.append('client_secret', CLIENT_SECRET);
  params.append('scope', 'https://graph.microsoft.com/.default');
  params.append('grant_type', 'client_credentials');

  const resp = await axios.post(tokenUrl, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return resp.data.access_token;
}

async function sendMail(accessToken, { to, subject, message, regards, isHtml = false }) {
  const url = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(ORGANIZER_EMAIL)}/sendMail`;

  let fullMessage;
  let contentType;

  if (isHtml) {
    // For HTML emails, use the message as-is (it's already HTML)
    fullMessage = message;
    contentType = 'HTML';
  } else {
    // For plain text emails, append signature
    const signatureBlock = regards || `Regards,

Shivank Rajput
Deputy Manager- Data Analyst
EcoSoul Home Inc.
Cell: (+91) 831-887-5772
Email: shivank.rajput@ecosoulhome.com
Website: www.ecosoulhome.com`;

    fullMessage = `${message}\n\n${signatureBlock}`;
    contentType = 'Text';
  }

  const mailBody = {
    message: {
      subject,
      body: {
        contentType: contentType,
        content: fullMessage,
      },
      toRecipients: [
        {
          emailAddress: { address: to },
        },
      ],
    },
    saveToSentItems: true,
  };

  const resp = await axios.post(url, mailBody, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  return resp.status === 202 || resp.status === 200;
}

async function sendMailHandler(req, res) {
  try {
    const { to, subject, message, regards, isHtml } = req.body || {};

    if (!to || !subject || !message)
      return res.status(400).json({ error: 'Missing required fields: to, subject, message' });

    if (!isValidEmail(to))
      return res.status(400).json({ error: 'Invalid recipient email' });

    const token = await getAccessToken();
    const sent = await sendMail(token, { to, subject, message, regards, isHtml });

    if (sent) return res.json({ ok: true, message: '✅ Email sent successfully' });
    return res.status(500).json({ error: 'Failed to send email' });
  } catch (err) {
    console.error('Error in sendMailHandler:', err?.response?.data || err.message || err);
    const status = err?.response?.status || 500;
    const data = err?.response?.data || { error: err.message };
    return res.status(status).json({ error: 'Internal server error', details: data });
  }
}

module.exports = { sendMailHandler };
