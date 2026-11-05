import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { hasText, isLocale, negotiate, translate } from './index';

describe('translate', () => {
	it('returns plain texts in both languages', () => {
		expect(translate('fr', 'auth.login.title')).toBe('Connexion');
		expect(translate('en', 'auth.login.title')).toBe('Sign in');
	});

	it('fills values and handles ICU plurals', () => {
		expect(translate('fr', 'members.summary_active', { n: 1 })).toBe('1 membre actif');
		expect(translate('fr', 'members.summary_active', { n: 3 })).toBe('3 membres actifs');
		expect(translate('en', 'members.summary_active', { n: 1 })).toBe('1 active member');
		expect(translate('en', 'invitation.title', { org: 'Acme' })).toBe('Join Acme');
	});

	it('keeps the French typography of the export', () => {
		expect(translate('fr', 'members.roles_help.title')).toBe('Qui peut faire quoi ?');
	});

	it('returns the key when a text is missing', () => {
		expect(translate('fr', 'nope.missing')).toBe('nope.missing');
		expect(hasText('fr', 'nope.missing')).toBe(false);
	});
});

describe('negotiate', () => {
	it.each([
		['en-US,en;q=0.9,fr;q=0.8', 'en'],
		['de-DE,fr;q=0.5', 'fr'],
		['es, en;q=0.4', 'en'],
		['', 'fr'],
		[null, 'fr'],
		['fr-CI', 'fr']
	])('%s → %s', (header, expected) => expect(negotiate(header)).toBe(expected));

	it('recognises supported locales only', () => {
		expect(isLocale('en')).toBe(true);
		expect(isLocale('de')).toBe(false);
		expect(isLocale(3)).toBe(false);
	});
});

describe('every text used by the code exists in both languages', () => {
	const root = join(import.meta.dirname, '..', '..');
	const files: string[] = [];
	const walk = (dir: string) => {
		for (const name of readdirSync(dir)) {
			const path = join(dir, name);
			if (statSync(path).isDirectory()) walk(path);
			else if (/\.(svelte|ts)$/.test(name) && !name.endsWith('.test.ts')) files.push(path);
		}
	};
	walk(root);
	const keys = new Set<string>();
	for (const file of files) {
		for (const m of readFileSync(file, 'utf8').matchAll(/\bt\(\s*'([a-z_]+(?:\.[a-z0-9_]+)+)'/g)) keys.add(m[1]);
	}

	it('finds the keys', () => expect(keys.size).toBeGreaterThan(100));
	it.each([...keys].map((k) => [k]))('%s', (key) => {
		expect(hasText('fr', key)).toBe(true);
		expect(hasText('en', key)).toBe(true);
	});
});
