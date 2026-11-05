// `t()` for components: reads the language of the current page (set by the root layout).
import { page } from '$app/state';
import { defaultLocale, isLocale, translate, type Locale, type Values } from './index';

export function currentLocale(): Locale {
	const locale = page.data.locale;
	return isLocale(locale) ? locale : defaultLocale;
}

export function t(key: string, values?: Values): string {
	return translate(currentLocale(), key, values);
}
