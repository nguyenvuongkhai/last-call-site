// POST /api/check  { code }  → what the code would do, without using it up.
//
// Read-only on purpose: the web page can't see anyone's account, so the only
// honest thing it can say is whether a code is good. The app redeems it later
// (a separate endpoint, once the RevenueCat grant is wired).
//
//   200 { status: 'valid',       code, days }
//   200 { status: 'notFound',    code }
//   200 { status: 'alreadyUsed', code, usedAt }
//   200 { status: 'expired',     code, closedAt }
//   400 { error }   malformed request
//   405             anything but POST

import { lookup, normalizeCode, MIN_CODE_LENGTH } from '../_lib/codes';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export const onRequestPost: PagesFunction = async ({ request }) => {
  let raw: unknown;
  try {
    raw = ((await request.json()) as { code?: unknown }).code;
  } catch {
    return json({ error: 'Body must be JSON: { "code": "..." }' }, 400);
  }
  if (typeof raw !== 'string') return json({ error: 'code must be a string' }, 400);

  const code = normalizeCode(raw);
  if (code.length < MIN_CODE_LENGTH) return json({ error: 'code is too short' }, 400);

  const record = await lookup(code);
  if (!record) return json({ status: 'notFound', code });
  if (record.usedAt) return json({ status: 'alreadyUsed', code, usedAt: record.usedAt });
  if (record.closesAt && record.closesAt < Date.now()) {
    return json({ status: 'expired', code, closedAt: record.closesAt });
  }
  return json({ status: 'valid', code, days: record.days });
};

export const onRequest: PagesFunction = () =>
  new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
