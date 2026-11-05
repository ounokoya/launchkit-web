// Shared steps of the end-to-end tests: navigation, captures, the demo inbox (Mailpit), accounts.
import { createHash } from 'node:crypto';
import { expect, test, type APIRequestContext, type Page } from '@playwright/test';

export const MAILPIT = process.env.MAILPIT_URL ?? 'http://localhost:8025';
export const ARANGO = process.env.ARANGO_URL ?? 'http://127.0.0.1:8539';
const ARANGO_AUTH = `Basic ${Buffer.from(`root:${process.env.ARANGO_PASSWORD ?? 'launchkit-local'}`).toString('base64')}`;
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin-demo-local';
export const PASSWORD = 'motdepasse-1';

/** Navigates and waits until the page is interactive (hydrated). */
export async function open(page: Page, url: string) {
	const response = await page.goto(url);
	await page.waitForSelector('html[data-ready]');
	return response;
}

export async function capture(page: Page, name: string) {
	await page.screenshot({ path: `captures/${test.info().project.name}/${name}.png`, fullPage: true });
}

export function uniqueEmail(who: string) {
	const size = test.info().project.name.replace(/\D/g, '');
	return `${who}-${size}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}@demo.test`;
}

type Message = { ID: string; Subject: string };

/** Messages sent to `to` whose subject contains `subject`. */
export async function messages(request: APIRequestContext, to: string, subject: string): Promise<Message[]> {
	const search = await (await request.get(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${to}"`)}`)).json();
	return search.messages.filter((m: Message) => m.Subject.includes(subject));
}

/** Text of the latest e-mail to `to` whose subject contains `subject`, as soon as the worker has sent it. */
export async function mail(request: APIRequestContext, to: string, subject: string, count = 1): Promise<string> {
	let text = '';
	await expect
		.poll(
			async () => {
				const found = await messages(request, to, subject);
				if (found.length < count) return false;
				text = (await (await request.get(`${MAILPIT}/api/v1/message/${found[0].ID}`)).json()).Text;
				return true;
			},
			{ timeout: 30_000 }
		)
		.toBe(true);
	return text;
}

export function linkPath(text: string, pattern: RegExp): string {
	const match = text.match(pattern);
	expect(match, text).not.toBeNull();
	return match![0];
}

export async function signUp(page: Page, request: APIRequestContext, name: string, email: string, shots = false) {
	await open(page, '/signup');
	if (shots) await capture(page, 'w02-inscription');
	await page.fill('input[name=name]', name);
	await page.fill('input[name=email]', email);
	await page.fill('input[name=password]', PASSWORD);
	await page.click('form button[type=submit]');
	await expect(page).toHaveURL(/\/verify-email\?email=/);
	if (shots) await capture(page, 'w04-verifier-email');
	const text = await mail(request, email, 'adresse');
	await open(page, linkPath(text, /\/verify-email\?token=[\w%-]+/));
}

/** Signs up a new person and creates their organization; returns its /app/<id> path. */
export async function ownerWithOrg(page: Page, request: APIRequestContext, email: string, org: string) {
	await signUp(page, request, 'Marie Koné', email);
	await expect(page).toHaveURL(/\/onboarding/);
	await page.fill('input[name=name]', org);
	await page.click('form button[type=submit]');
	await expect(page).toHaveURL(/\/app\/\w+$/);
	return new URL(page.url()).pathname;
}

export async function signIn(page: Page, email: string, password = PASSWORD) {
	await open(page, '/login');
	await page.fill('input[name=email]', email);
	await page.fill('input[name=password]', password);
	await page.click('form button[type=submit]');
	await expect(page).not.toHaveURL(/\/login/);
}

/** On a phone the sidebar is folded into a menu: opens it when needed (also without JavaScript). */
export async function showSidebar(page: Page) {
	const toggle = page.locator('.mobile-menu summary');
	if ((await toggle.isVisible()) && !(await page.locator('.sidebar nav').isVisible())) await toggle.click();
}

export async function createProject(page: Page, orgPath: string, name: string) {
	await open(page, `${orgPath}/projects/new`);
	await page.fill('input[name=name]', name);
	await page.click('form button[type=submit]');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(name);
	return new URL(page.url()).pathname;
}

/** Runs AQL on the demo database. Only used to age a link or a session, as time would. */
export async function aql(request: APIRequestContext, query: string, bindVars: Record<string, unknown>): Promise<unknown[]> {
	const response = await request.post(`${ARANGO}/_db/launchkit/_api/cursor`, {
		headers: { Authorization: ARANGO_AUTH },
		data: { query, bindVars }
	});
	expect(response.ok(), await response.text()).toBe(true);
	return (await response.json()).result;
}

/** The API keeps only the SHA-256 of links and sessions (hex). */
export const sha256 = (token: string) => createHash('sha256').update(token).digest('hex');

/** Makes the link or session with this clear token expired; `collection` is email_tokens, invitations or sessions. */
export async function expire(request: APIRequestContext, collection: string, token: string) {
	const changed = await aql(
		request,
		'FOR d IN @@c FILTER d.tokenHash == @hash UPDATE d WITH { expiresAt: "2000-01-01T00:00:00.000Z" } IN @@c RETURN 1',
		{ '@c': collection, hash: sha256(token) }
	);
	expect(changed, `${collection}: token not found`).toEqual([1]);
}

export async function invite(page: Page, email: string, role: 'admin' | 'member' = 'member') {
	await page.fill('input[name=email]', email);
	await page.check(`input[name=role][value=${role}]`);
	await page.click('form[action="?/invite"] button[type=submit]');
}

