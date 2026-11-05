// Without JavaScript (P5: every write is a plain form): the main journey still works, page by page.
// No hydration to wait for here, so plain page.goto() instead of open().
import { expect, test } from '@playwright/test';
import { PASSWORD, capture, invite, linkPath, mail, showSidebar, uniqueEmail } from './helpers';

test.use({ javaScriptEnabled: false });

test('without JavaScript: sign-up, projects, members, Pro, language, sign-out', async ({ page, request }) => {
	const email = uniqueEmail('marie');
	const guest = uniqueEmail('jean');

	// Sign-up, link from the e-mail, organization.
	await page.goto('/signup');
	await page.fill('input[name=name]', 'Marie Koné');
	await page.fill('input[name=email]', email);
	await page.fill('input[name=password]', PASSWORD);
	await page.click('form button[type=submit]');
	await expect(page).toHaveURL(/\/verify-email\?email=/);
	await page.goto(linkPath(await mail(request, email, 'adresse'), /\/verify-email\?token=[\w%-]+/));
	await expect(page).toHaveURL(/\/onboarding/);
	await page.fill('input[name=name]', `Acme ${Date.now().toString(36)}`);
	await page.click('form button[type=submit]');
	await expect(page).toHaveURL(/\/app\/\w+$/);
	const org = new URL(page.url()).pathname;

	// Project: created, searched, edited, deleted after confirmation.
	await page.goto(`${org}/projects/new`);
	await page.fill('input[name=name]', 'Site vitrine');
	await page.click('main form button[type=submit]');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Site vitrine');
	await page.goto(`${org}/projects`);
	await page.getByRole('searchbox').fill('vitrine');
	await page.getByRole('searchbox').press('Enter');
	await expect(page).toHaveURL(/\?q=vitrine$/);
	await page.locator('ul.grid a').first().click();
	await page.getByRole('link', { name: 'Modifier' }).click();
	await page.fill('input[name=name]', 'Site vitrine 2027');
	await page.click('main form button[type=submit]');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Site vitrine 2027');
	await page.click('form[action="?/delete"] button[type=submit]');
	await page.locator('section.confirm button[type=submit]').click();
	await expect(page).toHaveURL(new RegExp(`${org}/projects$`));
	await expect(page.getByRole('heading', { level: 2 })).toHaveText('Aucun projet pour l’instant');

	// Members: invitation sent, then cancelled from the « … » menu (a <details>, no script).
	await page.goto(`${org}/members`);
	await invite(page, guest);
	await expect(page.getByRole('status')).toContainText(guest);
	const row = page.locator('li.row', { hasText: guest });
	await row.locator('summary').click();
	await row.locator('form[action="?/cancel"] button').click();
	await expect(row).toHaveCount(0);

	// Pro: the page reloads itself until the worker has confirmed the simulated payment.
	await page.goto(`${org}/billing`);
	await page.click('form[action="?/checkout"] button[type=submit]');
	await expect(page.locator('.current .plan strong')).toHaveText('Pro', { timeout: 30_000 });
	await capture(page, 'sans-js-pro');

	// Language, then sign-out (phone: through the menu, also a <details>).
	await showSidebar(page);
	await page.getByRole('button', { name: 'EN', exact: true }).click();
	await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Billing');
	await showSidebar(page);
	await page.getByRole('button', { name: 'Sign out' }).click();
	await expect(page).toHaveURL(/\/$/);
	await page.goto(org);
	await expect(page).toHaveURL(/\/login\?redirectTo=/);
});
