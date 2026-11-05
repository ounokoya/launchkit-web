<script lang="ts">
	// W01 · Accueil
	import CreditCard from '@lucide/svelte/icons/credit-card';
	import Globe from '@lucide/svelte/icons/globe';
	import Layers from '@lucide/svelte/icons/layers';
	import Lock from '@lucide/svelte/icons/lock';
	import Shield from '@lucide/svelte/icons/shield';
	import Users from '@lucide/svelte/icons/users';
	import Badge from '$lib/components/Badge.svelte';
	import Button from '$lib/components/Button.svelte';
	import LanguageSwitch from '$lib/components/LanguageSwitch.svelte';
	import Logo from '$lib/components/Logo.svelte';
	import { t } from '$lib/i18n/t';

	let { data } = $props();

	const features = [
		{ id: 'accounts', icon: Lock },
		{ id: 'tenancy', icon: Layers },
		{ id: 'roles', icon: Users },
		{ id: 'plans', icon: CreditCard },
		{ id: 'backoffice', icon: Shield },
		{ id: 'i18n', icon: Globe }
	];
	const stack = ['SvelteKit', 'ASP.NET Core', 'ArangoDB', 'home.stack.rust_worker', 'Flutter', 'Kubernetes'];
	const steps = ['spec', 'decisions', 'tests', 'changelog'];
	const preview = [
		{ name: 'home.preview.project_1', status: 'active', tone: 'success' },
		{ name: 'home.preview.project_2', status: 'in_progress', tone: 'warning' },
		{ name: 'home.preview.project_3', status: 'draft', tone: 'neutral' }
	] as const;
</script>

<svelte:head><title>LaunchKit · {t('home.hero.badge')}</title></svelte:head>

<header class="nav">
	<a href="/" aria-label="LaunchKit"><Logo /></a>
	<nav class="links">
		<a href="#fonctionnalites">{t('home.nav.features')}</a>
		<a href="#formules">{t('home.nav.pricing')}</a>
		<a href="#methode">{t('home.nav.method')}</a>
		{#if data.sourceUrl}<a href={data.sourceUrl} rel="noopener noreferrer">{t('home.nav.source')}</a>{/if}
	</nav>
	<div class="actions">
		<LanguageSwitch />
		{#if data.user}
			<Button href="/app" size="sm">{t('common.nav.dashboard')}</Button>
		{:else}
			<Button href="/login" variant="secondary" size="sm">{t('home.nav.login')}</Button>
			<Button href="/signup" size="sm">{t('home.cta.try_demo')}</Button>
		{/if}
	</div>
</header>

<main>
	<section class="hero">
		<div class="pitch">
			<Badge tone="primary">{t('home.hero.badge')}</Badge>
			<h1>{t('home.hero.title')}</h1>
			<p class="subtitle">{t('home.hero.subtitle')}</p>
			<div class="ctas">
				<Button href="/signup" size="lg">{t('home.cta.try_demo')}</Button>
				{#if data.sourceUrl}<Button href={data.sourceUrl} variant="secondary" size="lg">{t('home.cta.view_code')}</Button>{/if}
			</div>
			<p class="note">{t('home.hero.demo_note')}</p>
		</div>
		<div class="preview" aria-hidden="true">
			<div class="window-bar"><span></span><span></span><span></span></div>
			<div class="preview-body">
				<ul class="mini-nav">
					<li>{t('common.nav.dashboard')}</li>
					<li class="on">{t('common.nav.projects')}</li>
					<li>{t('common.nav.members')}</li>
					<li>{t('common.nav.billing')}</li>
				</ul>
				<div class="mini-main">
					<div class="mini-head"><strong>{t('common.nav.projects')}</strong><Badge tone="warning">Free · 3 / 3</Badge></div>
					{#each preview as p (p.name)}
						<div class="mini-row">
							<span class="mini-icon"></span>
							<span class="mini-text"><strong>{t(p.name)}</strong><small>{t('home.preview.edited_recently')}</small></span>
							<Badge tone={p.tone}>{t(`common.status.${p.status}`)}</Badge>
						</div>
					{/each}
					<div class="mini-banner">
						<span>{t('upgrade.banner_title')}</span>
						<span class="mini-button">{t('upgrade.button')}</span>
					</div>
				</div>
			</div>
		</div>
	</section>

	<section class="section" id="fonctionnalites">
		<h2>{t('home.features.title')}</h2>
		<p class="section-lead">{t('home.features.subtitle')}</p>
		<div class="features">
			{#each features as f (f.id)}
				<article class="feature" id={f.id === 'plans' ? 'formules' : undefined}>
					<span class="feature-icon"><f.icon size={22} aria-hidden="true" /></span>
					<h3>{t(`home.features.${f.id}_title`)}</h3>
					<p>{t(`home.features.${f.id}_desc`)}</p>
				</article>
			{/each}
		</div>
		<div class="stack">
			<span class="stack-label">{t('home.stack.label')}</span>
			{#each stack as name (name)}<span>{name.startsWith('home.') ? t(name) : name}</span>{/each}
		</div>
	</section>

	<section class="section" id="methode">
		<h2>{t('home.method.title')}</h2>
		<ol class="steps">
			{#each steps as step, i (step)}
				<li>
					<span class="step-head"><span class="num">{i + 1}</span><strong>{t(`home.method.${step}_title`)}</strong></span>
					<p>{t(`home.method.${step}_desc`)}</p>
				</li>
			{/each}
		</ol>
	</section>
</main>

<footer>
	<div class="footer-inner">
		<div>
			<p class="cta">{t('home.footer.cta')}</p>
			<p class="legal">{t('home.footer.legal', { year: new Date().getFullYear() })}</p>
		</div>
		<div class="footer-actions">
			{#if data.androidUrl}<Button href={data.androidUrl} variant="secondary" external>{t('home.footer.android')}</Button>{/if}
			{#if data.contactUrl}<Button href={data.contactUrl}>{t('home.footer.contact')}</Button>{/if}
		</div>
	</div>
</footer>

<style>
	.nav {
		display: flex;
		align-items: center;
		gap: 24px;
		padding: 22px 80px;
		border-bottom: 1px solid var(--color-border);
	}
	.nav > a:hover {
		text-decoration: none;
	}
	.links {
		flex: 1;
		display: flex;
		justify-content: center;
		gap: 40px;
	}
	.links a {
		color: var(--color-text-secondary);
		font-size: var(--text-control);
		font-weight: 500;
	}
	.actions {
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.hero {
		display: grid;
		grid-template-columns: 660px 1fr;
		gap: 40px;
		align-items: center;
		padding: 64px 80px 110px;
		background: var(--color-surface);
	}
	.pitch {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 20px;
	}
	h1 {
		font-size: var(--text-display);
		line-height: 1.2;
		font-weight: 700;
	}
	.subtitle {
		max-width: 560px;
		font-size: 1.125rem;
		color: var(--color-text-secondary);
	}
	.ctas {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		margin-top: 14px;
	}
	.note {
		margin-top: 14px;
		font-size: var(--text-small);
		font-weight: 500;
		color: var(--color-text-muted);
	}
	.preview {
		border: 1px solid var(--color-border);
		border-radius: var(--radius-card);
		background: var(--color-bg);
		overflow: hidden;
		box-shadow: var(--shadow-modal);
	}
	.window-bar {
		display: flex;
		gap: 6px;
		padding: 13px 16px;
		background: var(--color-surface);
	}
	.window-bar span {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--color-danger-500);
	}
	.window-bar span:nth-child(2) {
		background: var(--color-warning-500);
	}
	.window-bar span:nth-child(3) {
		background: var(--color-success-500);
	}
	.preview-body {
		display: grid;
		grid-template-columns: 150px 1fr;
		min-height: 400px;
	}
	.mini-nav {
		list-style: none;
		margin: 0;
		padding: 20px 12px;
		background: var(--color-surface);
		font-size: var(--text-tiny);
		display: grid;
		align-content: start;
		gap: 10px;
	}
	.mini-nav li {
		padding: 6px 10px;
		border-radius: var(--radius-sm);
	}
	.mini-nav .on {
		background: var(--color-primary-50);
		color: var(--color-primary-500);
		font-weight: 600;
	}
	.mini-main {
		padding: 22px 24px;
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.mini-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 8px;
	}
	.mini-row {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 13px 14px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
	}
	.mini-icon {
		width: 28px;
		height: 28px;
		border-radius: var(--radius-md);
		background: var(--color-primary-50);
	}
	.mini-text {
		flex: 1;
		display: flex;
		flex-direction: column;
		font-size: var(--text-caption);
	}
	.mini-text small {
		color: var(--color-text-secondary);
		font-size: 0.6875rem;
	}
	.mini-banner {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		margin-top: 16px;
		padding: 14px;
		border-radius: var(--radius-lg);
		background: var(--color-primary-50);
		font-size: var(--text-tiny);
		font-weight: 600;
	}
	.mini-button {
		padding: 7px 14px;
		border-radius: var(--radius-md);
		background: var(--color-primary-500);
		color: #fff;
		white-space: nowrap;
	}
	.section {
		padding: 60px 80px 0;
	}
	h2 {
		font-size: 2.125rem;
		font-weight: 700;
		line-height: 1.2;
	}
	.section-lead {
		margin-top: 10px;
		font-size: 1.0625rem;
		color: var(--color-text-secondary);
	}
	.features {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 24px;
		margin-top: 40px;
	}
	.feature {
		padding: 24px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-card);
	}
	.feature-icon {
		display: grid;
		place-items: center;
		width: 40px;
		height: 40px;
		border-radius: var(--radius-control);
		background: var(--color-primary-50);
		color: var(--color-primary-500);
	}
	.feature h3 {
		margin-top: 16px;
		font-size: 1.0625rem;
		font-weight: 700;
	}
	.feature p {
		margin-top: 6px;
		font-size: var(--text-small);
		color: var(--color-text-secondary);
	}
	.stack {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 16px 32px;
		margin-top: 44px;
		padding: 28px 32px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-card);
		background: var(--color-surface);
		font-size: 1.0625rem;
		font-weight: 600;
	}
	.stack-label {
		font-size: var(--text-tiny);
		font-weight: 700;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}
	h2 + .steps {
		margin-top: 28px;
	}
	.steps {
		list-style: none;
		padding: 0 0 60px;
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 46px;
	}
	.step-head {
		display: flex;
		align-items: center;
		gap: 12px;
		font-size: 1.0625rem;
	}
	.num {
		display: grid;
		place-items: center;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--color-primary-500);
		color: #fff;
		font-size: var(--text-small);
		font-weight: 700;
	}
	.steps p {
		margin-top: 12px;
		font-size: var(--text-small);
		color: var(--color-text-secondary);
	}
	footer {
		background: var(--color-text);
		color: #fff;
	}
	.footer-inner {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 24px;
		padding: 30px 80px;
	}
	.cta {
		font-size: 1.25rem;
		font-weight: 700;
	}
	.footer-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 12px;
	}
	.legal {
		margin-top: 8px;
		font-size: var(--text-caption);
		color: var(--color-text-muted-on-dark);
	}
	@media (max-width: 1279px) {
		.hero {
			grid-template-columns: 1fr;
		}
		.preview {
			max-width: 640px;
		}
	}
	@media (max-width: 1023px) {
		.links {
			display: none;
		}
		.nav {
			justify-content: space-between;
			padding: 18px 24px;
		}
		.hero,
		.section,
		.footer-inner {
			padding-left: 24px;
			padding-right: 24px;
		}
		.features {
			grid-template-columns: repeat(2, 1fr);
		}
		.steps {
			grid-template-columns: repeat(2, 1fr);
			gap: 28px;
		}
	}
	@media (max-width: 767px) {
		.nav {
			flex-wrap: wrap;
			padding: 14px 16px;
			gap: 12px;
		}
		.actions {
			flex-wrap: wrap;
		}
		.hero {
			padding: 36px 16px 56px;
		}
		h1 {
			font-size: 2.25rem;
		}
		.section,
		.footer-inner {
			padding-left: 16px;
			padding-right: 16px;
		}
		.section {
			padding-top: 44px;
		}
		h2 {
			font-size: 1.625rem;
		}
		.features,
		.steps {
			grid-template-columns: 1fr;
		}
		.preview-body {
			grid-template-columns: 1fr;
		}
		.mini-nav {
			display: none;
		}
		.footer-inner {
			flex-direction: column;
			align-items: flex-start;
		}
	}
</style>
