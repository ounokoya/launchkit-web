import { describe, expect, it, vi } from 'vitest';
import { ApiError, apiUrl, createApi, formFailure } from './api';
import { attempt, rethrow } from './errors';
import { projectBody } from './projects';
import { clearSession, markExpired, rememberNext, safeRedirect, setLocale, setSession, takeExpired, takeNext } from './session';

function response(status: number, body?: unknown) {
	return new Response(body === undefined ? null : JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
}

describe('createApi', () => {
	it('sends the bearer token, the language and JSON', async () => {
		const fetchFn = vi.fn(async () => response(200, { ok: true }));
		const api = createApi(fetchFn as unknown as typeof fetch, { token: 'abc', locale: 'en' });

		expect(await api.post('/orgs', { name: 'Acme' })).toEqual({ ok: true });

		const [url, init] = fetchFn.mock.calls[0] as unknown as [string, RequestInit];
		expect(url).toBe(`${apiUrl()}/api/v1/orgs`);
		expect(init.method).toBe('POST');
		expect(init.body).toBe('{"name":"Acme"}');
		expect(init.headers).toMatchObject({ Authorization: 'Bearer abc', 'Accept-Language': 'en', 'Content-Type': 'application/json' });
	});

	it('returns null for empty 204 / 202 answers and parses a 202 body', async () => {
		const api = createApi((async () => response(204)) as unknown as typeof fetch);
		expect(await api.delete('/x')).toBeNull();
		const accepted = createApi((async () => response(202, { paymentId: '7' })) as unknown as typeof fetch);
		expect(await accepted.post('/checkout')).toEqual({ paymentId: '7' });
		const get = createApi((async () => response(200, [1])) as unknown as typeof fetch);
		expect(await get.get('/list')).toEqual([1]);
		expect(await get.patch('/me', { name: 'x' })).toEqual([1]);
	});

	it('turns a problem+json answer into an ApiError', async () => {
		const api = createApi((async () =>
			response(409, { code: 'plan_limit_reached', detail: 'Limite atteinte', errors: { name: ['x'] } })) as unknown as typeof fetch);
		const error = (await api.get("/x").catch((e: unknown) => e)) as ApiError;
		expect(error).toBeInstanceOf(ApiError);
		expect(error).toMatchObject({ status: 409, code: 'plan_limit_reached', detail: 'Limite atteinte', errors: { name: ['x'] } });
		expect(formFailure(error, { name: 'P' })).toEqual({
			code: 'plan_limit_reached', message: 'Limite atteinte', errors: { name: ['x'] }, values: { name: 'P' }
		});
	});

	it('copes with an error without a JSON body', async () => {
		const api = createApi((async () => new Response('boom', { status: 502, statusText: 'Bad Gateway' })) as unknown as typeof fetch);
		await expect(api.get('/x')).rejects.toMatchObject({ status: 502, code: 'server_error', detail: 'Bad Gateway' });
	});
});

function fakeCookies() {
	const jar = new Map<string, { value: string; options: Record<string, unknown> }>();
	return {
		jar,
		get: (name: string) => jar.get(name)?.value,
		set: (name: string, value: string, options: Record<string, unknown>) => jar.set(name, { value, options }),
		delete: (name: string) => jar.delete(name)
	};
}

describe('session cookies', () => {
	it('keeps the token in an HttpOnly cookie until the API expiry date', () => {
		const cookies = fakeCookies();
		setSession(cookies as never, 'tok', '2026-11-18T10:00:00.000Z');
		expect(cookies.jar.get('lk_session')).toEqual({
			value: 'tok',
			options: { path: '/', httpOnly: true, sameSite: 'lax', expires: new Date('2026-11-18T10:00:00.000Z') }
		});
		clearSession(cookies as never);
		expect(cookies.get('lk_session')).toBeUndefined();
	});

	it('remembers the language for a year', () => {
		const cookies = fakeCookies();
		setLocale(cookies as never, 'en');
		expect(cookies.jar.get('lk_locale')?.options.maxAge).toBe(31536000);
	});

	it('keeps the page to come back to once, then forgets it', () => {
		const cookies = fakeCookies();
		rememberNext(cookies as never, '/invitations/abc');
		expect(takeNext(cookies as never)).toBe('/invitations/abc');
		expect(takeNext(cookies as never)).toBe('/app');
	});

	it('says once that the session expired', () => {
		const cookies = fakeCookies();
		expect(takeExpired(cookies as never)).toBe(false);
		markExpired(cookies as never);
		expect(cookies.jar.get('lk_expired')?.options).toMatchObject({ httpOnly: true, maxAge: 600 });
		expect(takeExpired(cookies as never)).toBe(true);
		expect(takeExpired(cookies as never)).toBe(false);
	});

	it.each([
		['/app/12', '/app/12'],
		['https://evil.example', '/app'],
		['//evil.example', '/app'],
		['/\\evil.example', '/app'],
		[null, '/app'],
		['', '/app']
	])('safeRedirect(%s) → %s', (target, expected) => expect(safeRedirect(target)).toBe(expected));
});

describe('errors', () => {
	const url = new URL('http://localhost/app/1/billing?x=1');

	it('sends an expired session to the sign-in page, back to the same address', () => {
		expect(() => rethrow(new ApiError(401, 'unauthorized', 'x'), url)).toThrow(
			expect.objectContaining({ status: 303, location: '/login?redirectTo=%2Fapp%2F1%2Fbilling%3Fx%3D1' })
		);
		expect(() => rethrow(new ApiError(401, 'unauthorized', 'x'))).toThrow(expect.objectContaining({ location: '/login?redirectTo=%2Fapp' }));
	});

	it('turns other API errors into page errors with the translated message', () => {
		expect(() => rethrow(new ApiError(403, 'forbidden', 'Accès refusé'), url)).toThrow(
			expect.objectContaining({ status: 403, body: { message: 'Accès refusé', code: 'forbidden' } })
		);
		const bug = new TypeError('bug');
		expect(() => rethrow(bug, url)).toThrow(bug);
	});

	it('attempt returns refused requests and rethrows the rest', async () => {
		const refused = new ApiError(409, 'x', 'y');
		expect(await attempt(async () => 1)).toBe(1);
		expect(await attempt(async () => Promise.reject(refused))).toBe(refused);
		await expect(attempt(async () => Promise.reject(new ApiError(500, 'x', 'y')))).rejects.toBeInstanceOf(ApiError);
	});
});

describe('projectBody', () => {
	it('reads the project form', () => {
		const form = new FormData();
		form.set('name', '  Site vitrine ');
		form.set('description', 'Refonte');
		form.set('leadId', '');
		form.set('dueDate', '');
		expect(projectBody(form)).toEqual({ name: 'Site vitrine', description: 'Refonte', status: 'draft', leadId: '', dueDate: null });
		form.set('status', 'active');
		form.set('dueDate', '2026-11-28');
		expect(projectBody(form)).toMatchObject({ status: 'active', dueDate: '2026-11-28' });
	});
});
