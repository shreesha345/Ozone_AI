export async function sendEmail({
  apiKey,
  fromEmail,
  toEmail,
  subject,
  content,
}: {
  apiKey?: string;
  fromEmail: string;
  toEmail: string;
  subject: string;
  content: string;
}) {
  // Using SendGrid-compatible API shape for demo. In production, call from server.
  const endpoint = 'https://api.sendgrid.com/v3/mail/send';

  const body = {
    personalizations: [{ to: [{ email: toEmail }] }],
    from: { email: fromEmail },
    subject: subject,
    content: [{ type: 'text/plain', value: content }],
  };

  const curl = `curl '${endpoint}' -X POST \\` +
    `\\n-H 'Authorization: Bearer ${apiKey || '[SENDGRID_API_KEY]'}' \\` +
    `\\n-H 'Content-Type: application/json' \\` +
    `\\n-d '${JSON.stringify(body).replace(/'/g, "'\\\''")}'`;

  console.log('[EmailService] sendEmail called. Prepared curl:\n', curl);

  if (!apiKey) {
    console.log('[EmailService] Missing SENDGRID API key; skipping fetch.');
    return { ok: false, reason: 'no-credentials' };
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const text = await res.text();
    console.log('[EmailService] send status:', res.status);
    console.log('[EmailService] send body:', text);
    return { ok: res.ok, status: res.status, body: text };
  } catch (err) {
    console.error('[EmailService] fetch failed', err);
    return { ok: false, reason: 'fetch-failed', error: String(err) };
  }
}
