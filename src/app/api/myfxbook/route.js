import { getAccount, MyfxbookError } from './myfxbook.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  const account = new URL(request.url).searchParams.get('account') || 'current';
  try {
    const data = await getAccount(account);
    return Response.json(data, { headers: {
      'Cache-Control': 'public, max-age=60, s-maxage=900',
      'X-Content-Type-Options': 'nosniff',
    } });
  } catch (error) {
    const known = error instanceof MyfxbookError;
    const code = known ? error.code : 'INTERNAL_ERROR';
    const status = code === 'INVALID_ACCOUNT' ? 400 : code === 'NOT_CONFIGURED' ? 503 : code === 'INTERNAL_ERROR' ? 500 : 502;
    const body = { error: code, stage: known ? error.stage : null };
    if (known && error.httpStatus !== null) body.upstreamStatus = error.httpStatus;
    // Redacted upstream text is only returned by local development (npm run dev).
    if (known && process.env.NODE_ENV === 'development' && error.upstreamMessage) {
      body.message = error.upstreamMessage;
    }
    return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
  }
}
