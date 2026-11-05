import { describe, expect, it } from 'vitest';
import { activityText, avatarColor, initials, longDate, price, relativeTime, shortDate } from './format';

const now = new Date('2026-11-04T12:00:00Z');
const ago = (seconds: number) => new Date(now.getTime() - seconds * 1000).toISOString();

describe('relativeTime', () => {
	it.each([
		[10, 'à l’instant', 'just now'],
		[5 * 60, 'il y a 5 min', '5 min ago'],
		[2 * 3600, 'il y a 2 h', '2 h ago'],
		[30 * 3600, 'hier', 'yesterday'],
		[3 * 86400, 'il y a 3 jours', '3 days ago']
	])('%i s', (seconds, fr, en) => {
		expect(relativeTime(ago(seconds), 'fr', now)).toBe(fr);
		expect(relativeTime(ago(seconds), 'en', now)).toBe(en);
	});

	it('never goes negative for dates in the future', () => {
		expect(relativeTime(new Date(now.getTime() + 60_000).toISOString(), 'fr', now)).toBe('à l’instant');
	});
});

describe('dates and prices', () => {
	it('formats long and short dates in each language', () => {
		expect(longDate('2026-11-28', 'fr')).toBe('28 novembre 2026');
		expect(longDate('2026-11-28', 'en')).toBe('November 28, 2026');
		expect(longDate('2026-11-01T10:00:00.000Z', 'fr')).toBe('1 novembre 2026');
		expect(shortDate('2026-11-04T10:00:00.000Z', 'fr')).toBe('4 nov. 2026');
	});

	it('formats prices from cents', () => {
		expect(price(2900, 'EUR', 'fr')).toBe('29 €');
		expect(price(0, 'EUR', 'en')).toBe('€0');
		expect(price(2950, 'EUR', 'en')).toBe('€29.50');
	});
});

describe('people', () => {
	it.each([
		['Marie Koné', 'MK'],
		['Awa', 'AW'],
		['  Jean   Paul Diallo ', 'JD'],
		['', '?']
	])('initials of %s', (name, expected) => expect(initials(name)).toBe(expected));

	it('gives a stable colour between 1 and 5', () => {
		expect(avatarColor('abc')).toBe(avatarColor('abc'));
		for (const id of ['1', '42', 'xyz', 'super-admin']) {
			expect(avatarColor(id)).toBeGreaterThanOrEqual(1);
			expect(avatarColor(id)).toBeLessThanOrEqual(5);
		}
	});
});

describe('activityText', () => {
	const marie = { id: '1', name: 'Marie Koné' };
	it.each([
		['org_created', { org: 'Acme' }, marie, 'Organisation Acme créée'],
		['member_joined', { name: 'Jean Diallo' }, marie, 'Jean Diallo a rejoint Acme'],
		['invitation_sent', { email: 'awa@demo.test' }, marie, 'Invitation envoyée à awa@demo.test'],
		['project_created', { project: 'App mobile' }, marie, 'Marie Koné a créé « App mobile »'],
		['project_status_changed', { project: 'X', status: 'active' }, marie, 'Marie Koné a changé le statut en « Actif »'],
		['project_description_changed', { project: 'X' }, marie, 'Marie Koné a modifié la description'],
		['plan_upgraded', { plan: 'pro' }, null, 'Acme passe en Pro'],
		['something_else', {}, null, 'something_else']
	])('%s', (type, data, actor, expected) => {
		expect(activityText({ type, data: data as Record<string, string>, actor }, 'fr', 'Acme')).toBe(expected);
	});
});
