// GET /api/health → confirms Functions are deployed alongside the static site.
export const onRequestGet: PagesFunction = () =>
  new Response(JSON.stringify({ ok: true }), {
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
