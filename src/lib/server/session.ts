// Cookies of the web app (spec web.md): the session token never reaches browser JavaScript.
import type { Cookies } from '@sveltejs/kit';

export const SESSION_COOKIE = 'lk_session';
export const LOCALE_COOKIE = 'lk_locale';
/** Where to go once signed in, kept across sign-up and e-mail verification (invitation links). */
export const NEXT_COOKIE = 'lk_next';
/** Set when the API refused the session: the sign-in page then says why (once). */
export const EXPIRED_COOKIE = 'lk_expired';

export function setSession(cookies: Cookies, token: string, expiresAt: string) {
	cookies.set(SESSION_COOKIE, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		expires: new Date(expiresAt)
	});
}

export function clearSession(cookies: Cookies) {
	cookies.delete(SESSION_COOKIE, { path: '/' });
}

export function markExpired(cookies: Cookies) {
	cookies.set(EXPIRED_COOKIE, '1', { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 10 });
}

/** True once after `markExpired`. */
export function takeExpired(cookies: Cookies): boolean {
	if (!cookies.get(EXPIRED_COOKIE)) return false;
	cookies.delete(EXPIRED_COOKIE, { path: '/' });
	return true;
}

export function setLocale(cookies: Cookies, locale: string) {
	cookies.set(LOCALE_COOKIE, locale, {
		path: '/',
		httpOnly: false,
		sameSite: 'lax',
		maxAge: 60 * 60 * 24 * 365
	});
}

/** Only same-site paths are accepted as a return address (no open redirect). */
export function safeRedirect(target: string | null | undefined, fallback = '/app'): string {
	return target && target.startsWith('/') && !target.startsWith('//') && !target.startsWith('/\\') ? target : fallback;
}

export function rememberNext(cookies: Cookies, path: string) {
	cookies.set(NEXT_COOKIE, path, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 });
}

export function takeNext(cookies: Cookies, fallback = '/app'): string {
	const next = cookies.get(NEXT_COOKIE);
	if (next) cookies.delete(NEXT_COOKIE, { path: '/' });
	return safeRedirect(next, fallback);
}
