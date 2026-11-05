// The cases left out of scenario A / B: account, invitations and roles, project editing and deletion, settings,
// several organizations, the phone menu. Same server stack as the scenario; every account is new.
import { expect, test, type Browser, type Locator, type Page } from '@playwright/test';
import { PASSWORD, createProject, linkPath, mail, open, ownerWithOrg, showSidebar, signIn, signUp, uniqueEmail } from './helpers';

const isPhone = () => test.info().project.name.startsWith('phone');

/** Opens the « … » menu of a members row (a click on an open menu would close it). */
async function rowMenu(row: Locator) {
	const menu = row.locator('details.menu');
	if (!(await menu.evaluate((d) => (d as HTMLDetailsElement).open))) await menu.locator('summary').click();
	return menu;
}

/** Someone new opens an invitation link, signs up, and comes back to the invitation. */
async function guestOpens(browser: Browser, request: Parameters<typeof signUp>[1], name: string, email: string) {
	const context = await browser.newContext({ locale: 'fr-FR' });
	const page = await context.newPage();
	const invitation = linkPath(await mail(request, email, 'invite'), /\/invitations\/[\w%-]+/);
	await open(page, invitation);
	await expect(page).toHaveURL(/\/login\?redirectTo=/);
	await signUp(page, request, name, email);
	await expect(page).toHaveURL(new RegExp(invitation));
	return { page, context };
}

test('account: sign-in required, refused password, new link, invalid link, sign-out', async ({ page, request }) => {
	const email = uniqueEmail('awa');

	// The app needs a session.
	await open(page, '/app');
	await expect(page).toHaveURL(/\/login\?redirectTo=%2Fapp/);

	// Sign-up, then « Resend the email »: a second link arrives.
	await open(page, '/signup');
	await page.fill('input[name=name]', 'Awa Traoré');
	await page.fill('input[name=email]', email);
	await page.fill('input[name=password]', PASSWORD);
	await page.click('form button[type=submit]');
	await expect(page).toHaveURL(/\/verify-email\?email=/);
	await mail(request, email, 'adresse');
	await page.click('form[action="?/resend"] button[type=submit]');
	await expect(page.getByRole('status')).toContainText(`E-mail renvoyé à ${email}`);
	const text = await mail(request, email, 'adresse', 2);

	// A made-up link is refused; the real one signs in.
	await open(page, '/verify-email?token=lien-invalide');
	await expect(page.getByRole('alert')).toBeVisible();
	await open(page, linkPath(text, /\/verify-email\?token=[\w%-]+/));
	await expect(page).toHaveURL(/\/onboarding/);
	await page.fill('input[name=name]', `Initech ${Date.now().toString(36)}`);
	await page.click('form button[type=submit]');
	await expect(page).toHaveURL(/\/app\/\w+$/);
	const org = new URL(page.url()).pathname;

	// Sign-out, then the pages of the app ask to sign in again.
	await showSidebar(page);
	await page.getByRole('button', { name: 'Se déconnecter' }).click();
	await expect(page).toHaveURL(/\/$/);
	await open(page, `${org}/projects`);
	await expect(page).toHaveURL(new RegExp(`/login\\?redirectTo=${encodeURIComponent(`${org}/projects`)}`));

	// Wrong password: an error, no session. Right password: back to the requested page.
	await page.fill('input[name=email]', email);
	await page.fill('input[name=password]', 'mauvais-mot-de-passe');
	await page.click('form button[type=submit]');
	await expect(page.getByRole('alert')).toContainText('incorrect');
	await expect(page).toHaveURL(/\/login/);
	await page.fill('input[name=password]', PASSWORD);
	await page.click('form button[type=submit]');
	await expect(page).toHaveURL(new RegExp(`${org}/projects$`));
});

test('members: invitations resent, cancelled and declined, role changed, member removed', async ({ page, browser, request }) => {
	const owner = uniqueEmail('marie');
	const org = await ownerWithOrg(page, request, owner, `Globex ${Date.now().toString(36)}`);
	const [jean, awa, yao] = ['jean', 'awa', 'yao'].map(uniqueEmail);
	const row = (text: string) => page.locator('li.row', { hasText: text });

	const invite = async (email: string, role: string) => {
		await page.fill('input[name=email]', email);
		await page.check(`input[name=role][value=${role}]`);
		await page.click('form[action="?/invite"] button[type=submit]');
	};

	await open(page, `${org}/members`);
	for (const [email, role] of [[jean, 'member'], [awa, 'admin']]) {
		await invite(email, role);
		await expect(page.getByRole('status')).toContainText(email);
		await expect(row(email)).toContainText('En attente');
	}
	// The owner cannot be changed or removed: no menu on that row.
	await expect(row(owner).locator('details.menu')).toHaveCount(0);
	// Free counts 3 members, pending invitations included: a 3rd invitation is refused.
	await invite(yao, 'member');
	await expect(page.getByRole('alert')).toContainText('Passez en Pro');
	await expect(row(yao)).toHaveCount(0);

	// Resend Awa's invitation (a second e-mail), then cancel it: the link no longer works, and Yao can be invited.
	await (await rowMenu(row(awa))).locator('form[action="?/resend"] button').click();
	await mail(request, awa, 'invite', 2);
	await (await rowMenu(row(awa))).locator('form[action="?/cancel"] button').click();
	await expect(row(awa)).toHaveCount(0);
	await invite(yao, 'member');
	await expect(page.getByRole('status')).toContainText(yao);
	const awaSide = await guestOpens(browser, request, 'Awa Traoré', awa);
	await expect(awaSide.page.getByRole('heading', { level: 1 })).toHaveText('Cette invitation n’est plus valable.');
	await awaSide.context.close();

	// Jean declines: no organization, so the app offers to create one; the owner no longer sees him.
	const jeanSide = await guestOpens(browser, request, 'Jean Diallo', jean);
	await jeanSide.page.click('button[formaction="?/decline"]');
	await expect(jeanSide.page).toHaveURL(/\/onboarding/);
	await jeanSide.context.close();
	await open(page, `${org}/members`);
	await expect(row(jean)).toHaveCount(0);

	// Yao accepts; the owner makes him admin, then removes him: Yao loses access.
	const yaoSide = await guestOpens(browser, request, 'Yao Kouassi', yao);
	await yaoSide.page.click('button[formaction="?/accept"]');
	await expect(yaoSide.page).toHaveURL(new RegExp(`${org}$`));
	await open(page, `${org}/members`);
	await expect(row(yao)).toContainText('Membre');
	await (await rowMenu(row(yao))).locator('form[action="?/role"] button').click();
	await expect(row(yao)).toContainText('Admin');
	await (await rowMenu(row(yao))).locator('form[action="?/remove"] button').click();
	await expect(row(yao)).toHaveCount(0);
	const refused = await open(yaoSide.page, org);
	expect([403, 404]).toContain(refused?.status());
	await yaoSide.context.close();
});

test('projects: search, edit with a refused value, delete after confirmation', async ({ page, request }) => {
	const org = await ownerWithOrg(page, request, uniqueEmail('marie'), `Umbrella ${Date.now().toString(36)}`);
	const site = await createProject(page, org, 'Site vitrine');
	await createProject(page, org, 'App mobile');
	const cards = page.locator('ul.grid > li');

	// Search from the top bar.
	await open(page, `${org}/projects`);
	await expect(cards).toHaveCount(2);
	await page.getByRole('searchbox').fill('vitrine');
	await page.getByRole('searchbox').press('Enter');
	await expect(page).toHaveURL(/\?q=vitrine$/);
	await expect(cards).toHaveCount(1);
	await expect(cards).toContainText('Site vitrine');

	// Edit: a blank name is refused by the API, then the change is saved.
	await open(page, site);
	await page.getByRole('link', { name: 'Modifier' }).click();
	await expect(page).toHaveURL(new RegExp(`${site}/edit$`));
	await page.waitForSelector('html[data-ready]');
	await page.fill('input[name=name]', '   ');
	await page.click('main form button[type=submit]');
	await expect(page.getByText('Ce champ est obligatoire.')).toBeVisible();
	await page.fill('input[name=name]', 'Site vitrine 2027');
	await page.selectOption('select[name=status]', 'in_progress');
	await page.click('main form button[type=submit]');
	await expect(page).toHaveURL(new RegExp(`${site}$`));
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Site vitrine 2027');
	await expect(page.locator('.head')).toContainText('En cours');

	// Delete asks for a confirmation; « Cancel » keeps the project, confirming deletes it.
	const confirm = page.locator('section.confirm');
	await page.click('form[action="?/delete"] button[type=submit]');
	await expect(confirm).toBeVisible();
	await confirm.getByRole('link', { name: 'Annuler' }).click();
	await expect(confirm).toHaveCount(0);
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Site vitrine 2027');
	await page.click('form[action="?/delete"] button[type=submit]');
	await confirm.locator('button[type=submit]').click();
	await expect(page).toHaveURL(new RegExp(`${org}/projects$`));
	await expect(cards).toHaveCount(1);
	await expect(cards).toContainText('App mobile');
});

test('settings, organizations and the phone menu', async ({ page, request }) => {
	const email = uniqueEmail('marie');
	const org = await ownerWithOrg(page, request, email, `Acme ${Date.now().toString(36)}`);
	const nav = page.getByRole('navigation', { name: 'Navigation' });

	// Under 768 px the sidebar is folded: the menu button shows it.
	if (isPhone()) await expect(nav).toBeHidden();
	await showSidebar(page);
	await expect(nav).toBeVisible();
	await nav.getByRole('link', { name: 'Paramètres' }).click();
	await expect(page).toHaveURL(new RegExp(`${org}/settings$`));
	await page.waitForSelector('html[data-ready]');

	// Profile: the new name is saved and shown in the sidebar.
	await page.fill('input[name=name]', 'Marie K. Koné');
	await page.click('main form button[type=submit]');
	await expect(page.getByRole('status')).toHaveText('Modifications enregistrées.');
	await showSidebar(page);
	await expect(page.locator('.me')).toContainText('Marie K. Koné');

	// Language: English right away, and still English after a new sign-in.
	await page.selectOption('select[name=locale]', 'en');
	await page.click('main form button[type=submit]');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Profile');
	await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	await page.context().clearCookies();
	await signIn(page, email);
	await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	await open(page, `${org}/settings`);
	await page.selectOption('select[name=locale]', 'fr');
	await page.click('main form button[type=submit]');
	await expect(page.getByRole('heading', { level: 1 })).toHaveText('Profil');

	// A second organization from the switcher; both are listed.
	const second = `Globex ${Date.now().toString(36)}`;
	await showSidebar(page);
	await page.locator('details.org summary').click();
	await page.getByRole('link', { name: 'Créer une organisation' }).click();
	await expect(page).toHaveURL(/\/onboarding/);
	await page.waitForSelector('html[data-ready]');
	await page.fill('input[name=name]', second);
	await page.click('form button[type=submit]');
	await expect(page).toHaveURL(/\/app\/\w+$/);
	expect(new URL(page.url()).pathname).not.toBe(org);
	await showSidebar(page);
	await page.locator('details.org summary').click();
	const orgs = page.locator('details.org ul');
	await expect(orgs.getByRole('link', { name: second })).toHaveAttribute('aria-current', 'page');
	await orgs.locator(`a[href="${org}"]`).click();
	await expect(page).toHaveURL(new RegExp(`${org}$`));
});
