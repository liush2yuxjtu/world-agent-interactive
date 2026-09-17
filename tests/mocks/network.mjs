const toHeaders = (headers = {}) => new Map(Object.entries(headers).map(([k, v]) => [k.toLowerCase(), String(v)]));

export function createMockResponse({ status = 200, body = null, headers = { 'content-type': 'application/json' } } = {}) {
  const headerMap = toHeaders(headers);
  const text = typeof body === 'string' ? body : body == null ? '' : JSON.stringify(body);
  return {
    status,
    ok: status >= 200 && status < 300,
    headers: { get: (name) => headerMap.get(String(name).toLowerCase()) ?? null },
    async json() { return text ? JSON.parse(text) : null; },
    async text() { return text; },
    clone() { return createMockResponse({ status, body, headers }); },
  };
}

export function createMockFetch(routes = []) {
  const calls = [];
  const normalized = routes.map((route) => ({ method: 'GET', ...route, method: (route.method ?? 'GET').toUpperCase() }));
  const fetch = async (input, init = {}) => {
    const url = typeof input === 'string' ? input : input.url;
    const method = (init.method ?? input?.method ?? 'GET').toUpperCase();
    const call = { url, method, body: init.body ?? null, headers: init.headers ?? {} };
    calls.push(call);
    if (init.signal?.aborted) throw Object.assign(new Error('The operation was aborted'), { name: 'AbortError' });
    const route = normalized.find((candidate) => candidate.method === method && (
      typeof candidate.url === 'function' ? candidate.url(url) : candidate.url instanceof RegExp ? candidate.url.test(url) : candidate.url === url
    ));
    if (!route) throw new Error(`Unmocked request: ${method} ${url}`);
    if (route.error) throw route.error;
    const result = typeof route.handler === 'function' ? await route.handler(call) : route.response;
    return createMockResponse(result);
  };
  fetch.calls = calls;
  fetch.reset = () => { calls.length = 0; };
  return fetch;
}
