// Texts of LaunchKit (ADR-0012): exported from brand/textes, formatted as ICU messages (plurals, values).
import { IntlMessageFormat } from 'intl-messageformat';
import en from './en.json';
import fr from './fr.json';

export const locales = ['fr', 'en'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'fr';

export type Values = Record<string, string | number>;

const messages: Record<Locale, Record<string, string>> = { fr, en };
const compiled = new Map<string, IntlMessageFormat>();

export function isLocale(value: unknown): value is Locale {
	return typeof value === 'string' && (locales as readonly string[]).includes(value);
}

/** Text of `key` in `locale`, values filled in. An unknown key returns the key, so it shows up in review. */
export function translate(locale: Locale, key: string, values?: Values): string {
	const text = messages[locale][key] ?? messages[defaultLocale][key];
	if (text === undefined) return key;
	if (!values && !text.includes('{')) return text;
	const id = `${locale}:${key}`;
	let format = compiled.get(id);
	if (!format) {
		format = new IntlMessageFormat(text, locale);
		compiled.set(id, format);
	}
	return String(format.format(values));
}

export function hasText(locale: Locale, key: string): boolean {
	return key in messages[locale];
}

/** Best supported language of an Accept-Language header, French otherwise. */
export function negotiate(acceptLanguage: string | null | undefined): Locale {
	const ranked = (acceptLanguage ?? '')
		.split(',')
		.map((part) => {
			const [tag, ...params] = part.trim().split(';');
			const q = params.map((p) => p.trim()).find((p) => p.startsWith('q='));
			return { lang: tag.split('-')[0].toLowerCase(), q: q ? Number(q.slice(2)) : 1 };
		})
		.filter((l) => l.lang && !Number.isNaN(l.q))
		.sort((a, b) => b.q - a.q);
	return ranked.map((l) => l.lang).find(isLocale) ?? defaultLocale;
}
