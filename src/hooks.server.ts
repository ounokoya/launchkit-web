import { isLocale, negotiate, translate } from '$lib/i18n';
import { ApiError, createApi } from '$lib/server/api';
import { clearSession, LOCALE_COOKIE, markExpired, SESSION_COOKIE } from '$lib/server/session';
import type { MyOrganization, User } from '$lib/types';
import type { Handle, HandleServerError } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const cookieLocale = event.cookies.get(LOCALE_COOKIE);
	event.locals.locale = isLocale(cookieLocale) ? cookieLocale : negotiate(event.request.headers.get('accept-language'));
	event.locals.organizations = [];
	event.locals.api = createApi(event.fetch, { locale: event.locals.locale });

	const token = event.cookies.get(SESSION_COOKIE);
	if (token) {
		const api = createApi(event.fetch, { token, locale: event.locals.locale });
		try {
			const me = await api.get<{ user: User; organizations: MyOrganization[] }>('/me');
			event.locals.token = token;
			event.locals.user = me.user;
			event.locals.organizations = me.organizations;
			event.locals.api = api;
			if (!cookieLocale) event.locals.locale = me.user.locale;
		} catch (e) {
			if (!(e instanceof ApiError) || e.status !== 401) throw e;
			clearSession(event.cookies); // expired or revoked session
			markExpired(event.cookies);
		}
	}

	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', event.locals.locale)
	});
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
	response.headers.set('Cross-Origin-Resource-Policy', 'same-origin');
	response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
	response.headers.set('Cross-Origin-Embedder-Policy', 'require-corp');
	// Pages are never stored: each one carries its own CSP nonce, and those of a signed-in person are private.
	// (Static files are served before this hook, with their long cache.)
	if (!response.headers.has('Cache-Control'))
		response.headers.set('Cache-Control', `${event.locals.user ? 'private, ' : ''}no-cache, no-store, must-revalidate`);
	return response;
};

// Unexpected errors (API unreachable, bug): logged here; the person only gets a translated message, never details.
export const handleError: HandleServerError = ({ error, event, status }) => {
	const locale = isLocale(event.locals.locale) ? event.locals.locale : negotiate(event.request.headers.get('accept-language'));
	if (status === 404) return { message: translate(locale, 'error.not_found.title'), code: 'not_found' };
	console.error(error);
	return { message: translate(locale, 'error.server.text'), code: 'server_error' };
};
