// Links and sessions that have expired (verification 24 h, invitation 7 days, session): time is simulated by moving
// the expiry date in the database, the rest goes through the real API and the e-mails received in Mailpit.
import { expect, test } from '@playwright/test';
import { PASSWORD, expire, invite, linkPath, mail, open, ownerWithOrg, signUp, uniqueEmail } from './helpers';

const VERIFY_LINK = /\/verify-email\?token=[\w%-]+/;
const INVITATION_LINK = /\/invitations\/[\w%-]+/;

test('an expired verification link lets the person ask for a new one', async ({ page, request }) => {
	const email = uniqueEmail('awa');
	await open(page, '/signup');
	await page.fill('input[name=name]', 'Awa Traoré');
	await page.fill('input[name=email]', email);
	await page.fill('input[name=password]', PASSWORD);
	await page.click('form button[type=submit]');
	await expect(page).toHaveURL(/\/verify-email\?email=/);
	const link = linkPath(await mail(request, email, 'adresse'), VERIFY_LINK);
	await expire(request, 'email_tokens', new URL(link, 'http://x').searchParams.get('token')!);

	await open(page, link);
	await expect(page.getByRole('alert')).toContainText('Ce lien n’est pas valable');
	await page.fill('input[name=email]', email);
	await page.click('form[action="?/resend"] button[type=submit]');
	await expect(page.getByRole('status')).toContainText(`E-mail renvoyé à ${email}`);
	await expect(page.getByRole('alert')).toHaveCount(0);

	const fresh = linkPath(await mail(request, email, 'adresse', 2), VERIFY_LINK);
	expect(fresh).not.toBe(link);
	await open(page, fresh);
	await expect(page).toHaveURL(/\/onboarding/);
});

test('an expired invitation says whom to ask; the one sent again works', async ({ page, browser, request }) => {
	const org = await ownerWithOrg(page, request, uniqueEmail('marie'), `Acme ${Date.now().toString(36)}`);
	const guest = uniqueEmail('jean');
	await open(page, `${org}/members`);
	await invite(page, guest);
	await expect(page.getByRole('status')).toContainText(guest);
	const link = linkPath(await mail(request, guest, 'invite'), INVITATION_LINK);
	await expire(request, 'invitations', decodeURIComponent(link.split('/').pop()!));

	const context = await browser.newContext({ locale: 'fr-FR' });
	const guestPage = await context.newPage();
	await open(guestPage, link);
	await signUp(guestPage, request, 'Jean Diallo', guest);
	await expect(guestPage).toHaveURL(new RegExp(link));
	await expect(guestPage.getByRole('heading', { level: 1 })).toHaveText('Cette invitation n’est plus valable.');
	await expect(guestPage.locator('.lead')).toContainText('Demandez à Marie Koné de vous en envoyer une nouvelle.');

	// The owner sends it again: new link, new 7 days.
	await open(page, `${org}/members`);
	const row = page.locator('li.row', { hasText: guest });
	await row.locator('summary').click();
	await row.locator('form[action="?/resend"] button').click();
	const fresh = linkPath(await mail(request, guest, 'invite', 2), INVITATION_LINK);
	expect(fresh).not.toBe(link);
	await open(guestPage, fresh);
	await guestPage.click('button[formaction="?/accept"]');
	await expect(guestPage).toHaveURL(new RegExp(`${org}$`));
	await context.close();
});

test('an expired session goes back to sign-in, says why, then returns to the page', async ({ page, request }) => {
	const email = uniqueEmail('marie');
	const org = await ownerWithOrg(page, request, email, `Acme ${Date.now().toString(36)}`);
	const session = (await page.context().cookies()).find((c) => c.name === 'lk_session');
	expect(session).toBeDefined();
	await expire(request, 'sessions', session!.value);

	await open(page, `${org}/members`);
	await expect(page).toHaveURL(new RegExp(`/login\\?redirectTo=${encodeURIComponent(`${org}/members`)}`));
	await expect(page.getByRole('status')).toHaveText('Votre session a expiré. Reconnectez-vous pour continuer.');
	await page.fill('input[name=email]', email);
	await page.fill('input[name=password]', PASSWORD);
	await page.click('form button[type=submit]');
	await expect(page).toHaveURL(new RegExp(`${org}/members$`));

	// The notice is shown once only.
	await page.context().clearCookies();
	await open(page, '/login');
	await expect(page.getByRole('status')).toHaveCount(0);
});
