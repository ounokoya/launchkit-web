// Small presentation helpers shared by the screens (pure functions, unit tested).
import { translate, type Locale } from './i18n';

/** « il y a 2 h », « hier »… from an ISO date (common.time.*). */
export function relativeTime(iso: string, locale: Locale, now: Date = new Date()): string {
	const seconds = Math.max(0, (now.getTime() - new Date(iso).getTime()) / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);
	const days = Math.floor(hours / 24);
	if (minutes < 1) return translate(locale, 'common.time.just_now');
	if (hours < 1) return translate(locale, 'common.time.minutes_ago', { n: minutes });
	if (days < 1) return translate(locale, 'common.time.hours_ago', { n: hours });
	if (days === 1) return translate(locale, 'common.time.yesterday');
	return translate(locale, 'common.time.days_ago', { n: days });
}

/** « 28 novembre 2026 » / « November 28, 2026 » for a YYYY-MM-DD or ISO date. */
export function longDate(value: string, locale: Locale): string {
	const date = value.length === 10 ? new Date(`${value}T00:00:00Z`) : new Date(value);
	return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC'
	}).format(date);
}

export function shortDate(value: string, locale: Locale): string {
	return new Intl.DateTimeFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
		day: 'numeric',
		month: 'short',
		year: 'numeric',
		timeZone: 'UTC'
	}).format(new Date(value));
}

export function initials(name: string): string {
	const words = name.trim().split(/\s+/).filter(Boolean);
	if (words.length === 0) return '?';
	const letters = words.length === 1 ? words[0].slice(0, 2) : words[0][0] + words[words.length - 1][0];
	return letters.toUpperCase();
}

const avatarColors = 5;

/** Stable colour (1…5) for a person or an organization, so the same id keeps the same colour. */
export function avatarColor(id: string): number {
	let hash = 0;
	for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
	return (hash % avatarColors) + 1;
}

export function price(cents: number, currency: string, locale: Locale): string {
	return new Intl.NumberFormat(locale === 'fr' ? 'fr-FR' : 'en-US', {
		style: 'currency',
		currency,
		maximumFractionDigits: cents % 100 === 0 ? 0 : 2
	}).format(cents / 100);
}

export type Activity = {
	type: string;
	data: Record<string, string>;
	actor: { id: string; name: string } | null;
};

/** Sentence of an activity (dashboard.activity.*, projects.history.*). */
export function activityText(a: Activity, locale: Locale, org: string): string {
	const name = a.actor?.name ?? 'LaunchKit';
	switch (a.type) {
		case 'org_created':
			return translate(locale, 'dashboard.activity.org_created', { org: a.data.org ?? org });
		case 'member_joined':
			return translate(locale, 'dashboard.activity.member_joined', { name: a.data.name ?? name, org });
		case 'invitation_sent':
			return translate(locale, 'dashboard.activity.invitation_sent', { email: a.data.email });
		case 'project_created':
			return translate(locale, 'dashboard.activity.project_created', { name, project: a.data.project });
		case 'project_status_changed':
			return translate(locale, 'projects.history.status_changed', {
				name,
				status: translate(locale, `common.status.${a.data.status}`)
			});
		case 'project_description_changed':
			return translate(locale, 'projects.history.description_changed', { name });
		case 'plan_upgraded':
			return translate(locale, 'email.pro_welcome.subject', { org });
		default:
			return a.type;
	}
}

export const statusTone: Record<string, 'success' | 'warning' | 'neutral'> = {
	active: 'success',
	in_progress: 'warning',
	draft: 'neutral'
};

export const roleTone: Record<string, 'primary' | 'neutral'> = {
	owner: 'primary',
	admin: 'primary',
	member: 'neutral'
};
