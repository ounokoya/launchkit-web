// Accessibility: axe-core (WCAG 2.0, 2.1 and 2.2, levels A and AA) on every kind of page, at the three sizes,
// and a keyboard-only journey. axe finds about half of the WCAG problems; colours, labels, roles and names are its
// strong point, so the keyboard test checks what it cannot see (order, menus, Enter to submit).
import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { ADMIN_PASSWORD, PASSWORD, createProject, invite, mail, linkPath, open, ownerWithOrg, showSidebar, signIn, uniqueEmail } from './helpers';

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

async function audit(page: Page, url: string, status = 200) {
	const response = await open(page, url);
	expect(response?.status(), url).toBe(status);
	const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
	expect(describe(violations), url).toEqual([]);
}

/** One line per problem: rule, element, and for contrasts the colours and the ratio found. */
function describe(violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations']) {
	return violations.flatMap((v) =>
		v.nodes.slice(0, 6).map((n) => {
			const d = n.any[0]?.data as { fgColor?: string; bgColor?: string; contrastRatio?: number } | undefined;
			const colours = d?.contrastRatio ? ` ${d.fgColor} on ${d.bgColor} = ${d.contrastRatio}:1` : '';
			return `${v.id} [${v.impact}] ${n.target.join(' ')}${colours}`;
		})
	);
}

test('axe: public and error pages', async ({ page }) => {
	for (const url of ['/', '/signup', '/login', '/verify-email?email=yao%40demo.test', '/verify-email?token=lien-invalide'])
		await audit(page, url);
	await audit(page, '/cette-page-n-existe-pas', 404);
	// A form sent back with errors.
	await open(page, '/login');
	await page.fill('input[name=email]', 'personne@demo.test');
	await page.fill('input[name=password]', 'mauvais-mot-de-passe');
	await page.click('form button[type=submit]');
	await expect(page.getByRole('alert')).toBeVisible();
	const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
	expect(describe(violations), '/login with an error').toEqual([]);
});

test('axe: pages of the app', async ({ page, request }) => {
	const org = await ownerWithOrg(page, request, uniqueEmail('marie'), `Acme ${Date.now().toString(36)}`);
	await audit(page, `${org}/projects`); // empty state
	const project = await createProject(page, org, 'Site vitrine');
	const guest = uniqueEmail('jean');
	await open(page, `${org}/members`);
	await invite(page, guest);
	await expect(page.getByRole('status')).toContainText(guest);
	const invitation = linkPath(await mail(request, guest, 'invite'), /\/invitations\/[\w%-]+/);

	for (const url of [org, `${org}/members`, `${org}/billing`, `${org}/projects`, `${org}/projects/new`, project, `${project}/edit`,
		`${org}/settings`, '/onboarding', invitation])
		await audit(page, url);
	await audit(page, '/admin', 403);

	// Open menus are audited too: the phone menu and the « … » menu of a member row.
	await open(page, `${org}/members`);
	await showSidebar(page);
	await page.locator('li.row', { hasText: guest }).locator('summary').click();
	const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze();
	expect(describe(violations), 'open menus').toEqual([]);
});

test('axe: back office', async ({ page }) => {
	await signIn(page, 'admin@demo.test', ADMIN_PASSWORD);
	for (const url of ['/admin', '/admin/users']) await audit(page, url);
});

test('keyboard only: sign in, then cancel an invitation from the « … » menu', async ({ page, request }) => {
	const email = uniqueEmail('marie');
	const org = await ownerWithOrg(page, request, email, `Acme ${Date.now().toString(36)}`);
	const guest = uniqueEmail('jean');
	await open(page, `${org}/members`);
	await invite(page, guest);
	await expect(page.getByRole('status')).toContainText(guest);
	await page.context().clearCookies();

	// Tab reaches the e-mail field, then the password; Enter sends the form.
	await open(page, `/login?redirectTo=${encodeURIComponent(`${org}/members`)}`);
	const field = page.locator('input[name=email]');
	for (let i = 0; i < 25 && !(await field.evaluate((el) => el === document.activeElement)); i++) await page.keyboard.press('Tab');
	await expect(field).toBeFocused();
	await page.keyboard.type(email);
	await page.keyboard.press('Tab');
	await expect(page.locator('input[name=password]')).toBeFocused();
	await page.keyboard.type(PASSWORD);
	await page.keyboard.press('Enter');
	await expect(page).toHaveURL(new RegExp(`${org}/members$`));
	await page.waitForSelector('html[data-ready]');

	// The menu opens with Enter; Tab goes to « Resend », then « Cancel the invitation ».
	const row = page.locator('li.row', { hasText: guest });
	await row.locator('summary').focus();
	await page.keyboard.press('Enter');
	await page.keyboard.press('Tab');
	await expect(row.locator('form[action="?/resend"] button')).toBeFocused();
	await page.keyboard.press('Tab');
	await expect(row.locator('form[action="?/cancel"] button')).toBeFocused();
	await page.keyboard.press('Enter');
	await expect(row).toHaveCount(0);
});
