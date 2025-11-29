export async function sendWhatsAppMessage({
  accountSid,
  authToken,
  fromNumber,
  toNumber,
  body,
  contentSid,
  contentVariables,
}: {
  accountSid?: string;
  authToken?: string;
  fromNumber: string;
  toNumber: string;
  body?: string;
  contentSid?: string;
  contentVariables?: Record<string, string>;
}) {
  const endpoint = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

  const params: Record<string, string> = {
    To: `whatsapp:${toNumber}`,
    From: `whatsapp:${fromNumber}`,
  };
  // Prefer simple Body if provided (text message). ContentVariables require a ContentSid.
  if (body) {
    params.Body = body;
  }
  if (contentSid) params.ContentSid = contentSid;
  if (contentVariables && contentSid) params.ContentVariables = JSON.stringify(contentVariables);

  const curl = `curl '${endpoint}' -X POST \\` +
    Object.entries(params).map(([k, v]) => `\\\n--data-urlencode '${k}=${v}' \\`).join('') +
    `\\n-u ${accountSid}:[AuthToken]`;

  console.log('Twilio sendWhatsAppMessage called.');
  console.log('Prepared curl (for debugging):\n', curl);

  if (!accountSid || !authToken) {
    console.log('Twilio credentials missing; skipping fetch.');
    return { ok: false, reason: 'no-credentials' };
  }

  try {
    const body = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => body.append(k, v));

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const text = await res.text();
    console.log('Twilio response status:', res.status);
    console.log('Twilio response body:', text);

    return { ok: res.ok, status: res.status, body: text };
  } catch (err) {
    console.error('Twilio fetch failed:', err);
    return { ok: false, reason: 'fetch-failed', error: String(err) };
  }
}
