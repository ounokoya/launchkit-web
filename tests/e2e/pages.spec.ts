// The FR | EN switch on every page: signed out, signed in, on error pages and in the back office.
// Each time the same page must come back, with the same status, in the other language, then in French again.
import { expect, test, type Page } from '@playwright/test';
import { ADMIN_PASSWORD, capture, createProject, linkPath, mail, open, ownerWithOrg, showSidebar, signIn, uniqueEmail } from './helpers';

/** Clicks FR or EN and returns the status of the page served again. */
async function switchTo(page: Page, locale: 'fr' | 'en') {
	const here = page.url();
	await showSidebar(page);
	const [response] = await Promise.all([
		page.waitForResponse((r) => r.request().method() === 'GET' && r.request().resourceType() === 'document' && r.url() === here),
		page.getByRole('button', { name: locale.toUpperCase(), exact: true }).click()
	]);
	await expect(page.locator('html')).toHaveAttribute('lang', locale);
	await page.waitForSelector('html[data-ready]');
	expect(page.url()).toBe(here);
	// On a phone the page comes back with its menu folded: the button is there, hidden.
	await expect(page.locator(`form[action="/lang"] button[value=${locale}]`).first()).toHaveAttribute('aria-pressed', 'true');
	return response.status();
}

/** Opens `url`, switches to the other language, then back: same status each time, the text changes and comes back. */
async function bothLanguages(page: Page, url: string, status = 200) {
	const first = await open(page, url);
	expect(first?.status(), url).toBe(status);
	const start = (await page.locator('html').getAttribute('lang')) === 'en' ? 'en' : 'fr';
	const other = start === 'fr' ? 'en' : 'fr';
	const text = await page.locator('body').innerText();
	expect(await switchTo(page, other), `${url} in ${other}`).toBe(status);
	expect(await page.locator('body').innerText(), `${url} in ${other}`).not.toBe(text);
	expect(await switchTo(page, start), `${url} in ${start}`).toBe(status);
	expect(await page.locator('body').innerText(), `${url} in ${start}`).toBe(text);
}

test('signed out: every public page switches language', async ({ page }) => {
	for (const url of ['/', '/signup', '/login', '/login?redirectTo=%2Fapp', '/verify-email?email=yao%40demo.test', '/verify-email?token=lien-invalide'])
		await bothLanguages(page, url);
	await bothLanguages(page, '/cette-page-n-existe-pas', 404);

	await open(page, '/login');
	await switchTo(page, 'en');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Sign in');
	await capture(page, 'w03-sign-in-en');
});

test('signed in: every page of the app switches language', async ({ page, request }) => {
	const org = await ownerWithOrg(page, request, uniqueEmail('marie'), `Acme ${Date.now().toString(36)}`);
	const project = await createProject(page, org, 'Site vitrine');
	// An invitation for someone else: the signed-in owner gets the « wrong account » card.
	const guest = uniqueEmail('jean');
	await open(page, `${org}/members`);
	await page.fill('input[name=email]', guest);
	await page.click('form[action="?/invite"] button[type=submit]');
	await expect(page.getByRole('status')).toContainText(guest);
	const invitation = linkPath(await mail(request, guest, 'invite'), /\/invitations\/[\w%-]+/);

	for (const url of [
		org,
		`${org}/members`,
		`${org}/billing`,
		`${org}/projects`,
		`${org}/projects?q=vitrine`,
		`${org}/projects/new`,
		project,
		`${project}/edit`,
		`${org}/settings`,
		'/onboarding',
		invitation
	])
		await bothLanguages(page, url);
	await expect(page.getByRole('alert')).toContainText(guest);
	await bothLanguages(page, '/admin', 403);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Accès refusé');
	await expect(page.locator('.lead')).toHaveText('Cette page est réservée au super-admin de la démo.');
	await bothLanguages(page, `${org}/projects/inexistant`, 404);
	await bothLanguages(page, '/cette-page-n-existe-pas', 404);
});

test('super admin: the back office switches language', async ({ page }) => {
	await signIn(page, 'admin@demo.test', ADMIN_PASSWORD);
	// The account keeps its language: start from French whatever an earlier run left.
	if ((await page.locator('html').getAttribute('lang')) === 'en') await switchTo(page, 'fr');
	for (const url of ['/admin', '/admin/users']) await bothLanguages(page, url);
});
