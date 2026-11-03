// Server-side only. Never import this module into a client component.
export const ACCOUNTS = Object.freeze({ current: 12205723, darwinex: 12209314, legacy: 12232265 });
export class MyfxbookError extends Error {
  constructor(code, stage = null, upstreamMessage = null, httpStatus = null) {
    super(code);
    this.code = code;
    this.stage = stage;
    this.upstreamMessage = upstreamMessage;
    this.httpStatus = httpStatus;
  }
}
// Redact credentials before retaining any diagnostic text. Raw response bodies and URLs are never exposed.
export function safeMessage(message, secrets = []) {
  if (typeof message !== 'string') return null;
  let text = message;
  for (const secret of secrets.filter(value => typeof value === 'string' && value.length)) {
    for (const variant of [secret, encodeURIComponent(secret), new URLSearchParams({ v: secret }).toString().slice(2)]) {
      text = text.split(variant).join('[redacted]');
    }
  }
  return text.replace(/https?:\/\/\S+/gi, '[url]')
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email]')
    .replace(/((?:session|password|token|api[-_ ]?key)\s*[:=]\s*)[^\s,;]+/gi, '$1[redacted]')
    .replace(/<[^>]*>/g, '').replace(/[\x00-\x1f\x7f]/g, ' ').slice(0, 300);
}
export function classifyRejection(message) {
  const text = typeof message === 'string' ? message : '';
  if (/invalid session|session.*invalid|session.*expired/i.test(text)) return 'INVALID_SESSION';
  if (/(?:wrong|invalid|incorrect).*(?:email|password|credentials)|authentication failed/i.test(text)) return 'AUTH_FAILED';
  if (/(?:invalid|not found|unknown).*account|account.*(?:invalid|not found)|no (?:permission|access)|access denied/i.test(text)) return 'ACCOUNT_ACCESS_DENIED';
  if (/required|missing.*(?:field|parameter)/i.test(text)) return 'MISSING_PARAMETER';
  if (/rate limit|too many|limit.*(?:request|exceed)/i.test(text)) return 'RATE_LIMITED';
  return 'UPSTREAM_REJECTED';
}
export function normalizeGain(input) {
  if (!Array.isArray(input)) throw new MyfxbookError('INVALID_DATA');
  const dates = new Map();
  for (const row of input.flat(Infinity)) {
    // Myfxbook dates are MM/DD/YYYY, in broker time. Do not timezone-shift them.
    const match = typeof row?.date === 'string' && /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(row.date);
    if (!match || row.value === null || row.value === '' || !['string', 'number'].includes(typeof row.value)) throw new MyfxbookError('INVALID_DATA');
    const [, mm, dd, yyyy] = match;
    const date = `${yyyy}-${mm}-${dd}`;
    const parsed = new Date(`${date}T00:00:00Z`);
    const gain = Number(row.value);
    if (!Number.isFinite(gain) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== date) throw new MyfxbookError('INVALID_DATA');
    dates.set(date, { date, gain });
  }
  // The endpoint provides growth-chart values. Do not sum dailyGain.value.
  return [...dates.values()].sort((a, b) => a.date.localeCompare(b.date));
}
export function createMyfxbookService({ fetcher = fetch, env = process.env, now = Date.now } = {}) {
  const cache = new Map(), pending = new Map();
  async function call(method, params) {
    const url = new URL(`https://www.myfxbook.com/api/${method}.json`);
    url.search = new URLSearchParams(params).toString();
    let result, response;
    try {
      response = await fetcher(url, { cache: 'no-store', signal: AbortSignal.timeout(12000), redirect: 'error' });
    } catch { throw new MyfxbookError('UPSTREAM_UNAVAILABLE', method); }
    if (!response.ok) throw new MyfxbookError(response.status === 429 ? 'RATE_LIMITED' : 'UPSTREAM_HTTP_ERROR', method, null, response.status);
    try { result = await response.json(); }
    catch { throw new MyfxbookError('INVALID_UPSTREAM_RESPONSE', method, null, response.status); }
    if (!result || typeof result !== 'object' || typeof result.error !== 'boolean') {
      throw new MyfxbookError('INVALID_UPSTREAM_RESPONSE', method, null, response.status);
    }
    if (result.error) {
      const message = safeMessage(result.message, [env.MYFXBOOK_EMAIL, env.MYFXBOOK_PASSWORD, params.session]);
      throw new MyfxbookError(classifyRejection(result.message), method, message, response.status);
    }
    return result;
  }
  async function download(key) {
    const email = env.MYFXBOOK_EMAIL, password = env.MYFXBOOK_PASSWORD;
    if (!email || !password) throw new MyfxbookError('NOT_CONFIGURED');
    // A fresh session for each refresh avoids reusing an IP-bound session across serverless instances.
    // The host must still use the same outgoing IP for login and subsequent calls.
    const login = await call('login', { email, password });
    if (typeof login.session !== 'string' || !login.session) throw new MyfxbookError('INVALID_UPSTREAM_RESPONSE', 'login');
    const session = login.session;
    try {
      const data = await call('get-daily-gain', {
        session, id: String(ACCOUNTS[key]), start: '2000-01-01',
        // Include the current broker day even when it is ahead of UTC.
        end: new Date(now() + 86400000).toISOString().slice(0, 10),
      });
      return { account: key, accountId: ACCOUNTS[key], metric: 'gain', unit: '%', points: normalizeGain(data.dailyGain), fetchedAt: new Date(now()).toISOString() };
    } finally {
      // No raw URLs, credentials, sessions or response bodies are logged/returned.
      await call('logout', { session }).catch(() => {});
    }
  }
  return async function getAccount(key) {
    if (!Object.hasOwn(ACCOUNTS, key)) throw new MyfxbookError('INVALID_ACCOUNT');
    const previous = cache.get(key);
    if (previous && previous.until > now()) {
      if (previous.error) throw previous.error;
      return previous.value;
    }
    if (pending.has(key)) return pending.get(key);
    const task = download(key).then(value => {
      cache.set(key, { value, until: now() + 15 * 60 * 1000 });
      return value;
    }).catch(error => {
      cache.set(key, { error, until: now() + 30000 });
      throw error;
    }).finally(() => pending.delete(key));
    pending.set(key, task);
    return task;
  };
}
export const getAccount = createMyfxbookService();
