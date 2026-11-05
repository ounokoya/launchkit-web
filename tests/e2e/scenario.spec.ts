// Scenario A / B in the browser (spec web.md), at 1440, 768 and 390 px.
// Needs the server stack (server/compose.yaml) and the web app; links are read from the e-mails in Mailpit.
// Every screen is captured into captures/<size>/ for the visual review.
import { expect, test } from '@playwright/test';
import { ADMIN_PASSWORD, capture, linkPath, mail, open, signUp } from './helpers';

test('A and B go through the whole journey', async ({ page, browser, request }) => {
	const run = `${test.info().project.name.replace(/\D/g, '')}-${Date.now().toString(36)}`;
	const emailA = `marie-${run}@demo.test`;
	const emailB = `jean-${run}@demo.test`;

	// W01, then A signs up, verifies the e-mail and creates Acme (W02, W04, W05).
	await open(page, '/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText('MVP');
	await capture(page, 'w01-accueil');
	await signUp(page, request, 'Marie Koné', emailA, true);
	await expect(page).toHaveURL(/\/onboarding/);
	await capture(page, 'w05-organisation');
	await page.fill('input[name=name]', `Acme ${run}`);
	await page.click('form button[type=submit]');
	await expect(page).toHaveURL(/\/app\/\w+$/);
	const orgPath = new URL(page.url()).pathname;
	await capture(page, 'w06-tableau-de-bord-vide');

	// Projects: empty state, then 3 projects; the 4th is refused (409) with the plan message (W10b, W10, W11).
	await open(page, `${orgPath}/projects`);
	await capture(page, 'w10b-projets-vide');
	for (const [name, status] of [
		['Site vitrine', 'active'],
		['App mobile', 'in_progress'],
		['Tableau de bord', 'draft']
	]) {
		await open(page, `${orgPath}/projects/new`);
		await page.fill('input[name=name]', name);
		await page.fill('textarea[name=description]', `${name} : projet de démonstration.`);
		await page.selectOption('select[name=status]', status);
		await page.click('form button[type=submit]');
		await expect(page.getByRole('heading', { level: 1 })).toHaveText(name);
	}
	await capture(page, 'w11-projet');
	await open(page, `${orgPath}/projects`);
	await expect(page.getByRole('status')).toContainText('3 projets sur 3');
	await capture(page, 'w10-projets-limite');
	await open(page, `${orgPath}/projects/new`);
	await page.fill('input[name=name]', 'Quatrième');
	await page.click('form button[type=submit]');
	await expect(page.getByRole('alert')).toContainText('limite');

	// Members: alone (W07b), then A invites B (W07).
	await open(page, `${orgPath}/members`);
	await capture(page, 'w07b-membres-seul');
	await page.fill('input[name=email]', emailB);
	await page.check('input[name=role][value=member]');
	await page.click('form[action="?/invite"] button[type=submit]');
	await expect(page.getByRole('status')).toContainText(emailB);
	await capture(page, 'w07-membres');
	await open(page, orgPath);
	await capture(page, 'w06-tableau-de-bord');

	// B opens the invitation link, signs in or up, comes back to the invitation and accepts (W03, W08).
	const contextB = await browser.newContext({ locale: 'fr-FR' });
	const pageB = await contextB.newPage();
	const invitation = linkPath(await mail(request, emailB, 'invite'), /\/invitations\/[\w%-]+/);
	await open(pageB, invitation);
	await expect(pageB).toHaveURL(/\/login\?redirectTo=/);
	await capture(pageB, 'w03-connexion');
	await signUp(pageB, request, 'Jean Diallo', emailB);
	await expect(pageB).toHaveURL(new RegExp(invitation));
	await capture(pageB, 'w08-invitation');
	await pageB.click('button[formaction="?/accept"]');
	await expect(pageB).toHaveURL(new RegExp(`${orgPath}$`));
	// B is a member: billing is refused (W14).
	const refused = await open(pageB, `${orgPath}/billing`);
	expect(refused?.status()).toBe(403);
	await capture(pageB, 'w14-acces-refuse');
	await contextB.close();

	// A upgrades: the Rust worker processes the simulated payment, the page shows « Bienvenue dans Pro » (W09, W09b).
	await open(page, `${orgPath}/billing`);
	await capture(page, 'w09-abonnement');
	await page.click('form[action="?/checkout"] button[type=submit]');
	await expect(page.getByRole('dialog')).toBeVisible({ timeout: 30_000 });
	await capture(page, 'w09b-pro-active');
	await page.getByRole('dialog').getByRole('button').click();

	// The 4th project is now accepted.
	await open(page, `${orgPath}/projects/new`);
	await page.fill('input[name=name]', 'Quatrième');
	await page.click('form button[type=submit]');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Quatrième');

	// The back office shows Acme on Pro (W12); an unknown page is a 404 (W13).
	const admin = await browser.newContext({ locale: 'fr-FR' });
	const pageAdmin = await admin.newPage();
	await open(pageAdmin, '/login');
	await pageAdmin.fill('input[name=email]', 'admin@demo.test');
	await pageAdmin.fill('input[name=password]', ADMIN_PASSWORD);
	await pageAdmin.click('form button[type=submit]');
	await expect(pageAdmin).not.toHaveURL(/\/login/);
	await open(pageAdmin, '/admin');
	const row = pageAdmin.getByRole('row', { name: new RegExp(`Acme ${run}`) });
	await expect(row).toContainText('Pro');
	await expect(row).toContainText('4');
	await capture(pageAdmin, 'w12-back-office');
	const missing = await open(pageAdmin, '/cette-page-n-existe-pas');
	expect(missing?.status()).toBe(404);
	await capture(pageAdmin, 'w13-introuvable');
	await admin.close();
});
