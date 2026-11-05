<script lang="ts">
	// Sign-up and sign-in (W02, W03): indigo brand panel on the left, the form on the right.
	import type { Snippet } from 'svelte';
	import Check from '@lucide/svelte/icons/check';
	import Mail from '@lucide/svelte/icons/mail';
	import { t } from '$lib/i18n/t';
	import LanguageSwitch from './LanguageSwitch.svelte';
	import Logo from './Logo.svelte';

	let { title, points, children }: { title: string; points: string[]; children: Snippet } = $props();
</script>

<div class="split">
	<aside class="brand">
		<span class="circle one" aria-hidden="true"></span>
		<span class="circle two" aria-hidden="true"></span>
		<a href="/" aria-label="LaunchKit"><Logo inverse /></a>
		<div class="pitch">
			<p class="title">{title}</p>
			<ul>
				{#each points as point (point)}
					<li><Check size={20} aria-hidden="true" />{point}</li>
				{/each}
			</ul>
		</div>
		<p class="demo"><Mail size={20} aria-hidden="true" />{t('common.demo_email_hint')}</p>
	</aside>
	<main>
		<div class="top">
			<a href="/" class="mobile-logo" aria-label="LaunchKit"><Logo /></a>
			<LanguageSwitch />
		</div>
		<div class="form">{@render children()}</div>
	</main>
</div>

<style>
	.split {
		display: grid;
		grid-template-columns: minmax(420px, 600px) 1fr;
		min-height: 100vh;
	}
	.brand {
		position: relative;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		padding: 56px 64px 92px;
		background: var(--color-primary-500);
		color: #fff;
	}
	.brand a {
		position: relative; /* above the decorative circles */
		align-self: flex-start;
	}
	.brand a:hover {
		text-decoration: none;
	}
	.circle {
		position: absolute;
		border-radius: 50%;
	}
	.one {
		width: 360px;
		height: 360px;
		left: -150px;
		top: -200px;
		background: var(--color-primary-600);
	}
	.two {
		width: 340px;
		height: 340px;
		right: -1px;
		bottom: -80px;
		transform: translateX(28%);
		background: var(--color-primary-400);
		opacity: 0.55;
	}
	.pitch {
		position: relative;
		margin: auto 0;
	}
	.title {
		font-size: 2.25rem;
		font-weight: 700;
		line-height: 1.2;
		max-width: 460px;
	}
	ul {
		list-style: none;
		margin: 56px 0 0;
		padding: 0;
		display: grid;
		gap: 18px;
		color: var(--color-primary-100);
		font-weight: 500;
	}
	li {
		display: flex;
		gap: 12px;
		align-items: center;
	}
	.demo {
		position: relative;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		border-radius: var(--radius-lg);
		background: var(--color-primary-600);
		font-size: var(--text-caption);
		font-weight: 500;
	}
	main {
		display: flex;
		flex-direction: column;
		padding: 32px 38px;
	}
	.top {
		display: flex;
		justify-content: flex-end;
		align-items: center;
	}
	.mobile-logo {
		display: none;
	}
	.form {
		width: min(400px, 100%);
		margin: auto;
		padding: 40px 0;
		display: flex;
		flex-direction: column;
		gap: 16px;
	}
	.form :global(h1) {
		font-size: 1.875rem;
		font-weight: 700;
	}
	.form :global(.lead) {
		color: var(--color-text-secondary);
		font-size: var(--text-control);
		margin-top: -8px;
		margin-bottom: 16px;
	}
	@media (max-width: 1023px) {
		.split {
			grid-template-columns: 1fr;
		}
		.brand {
			display: none;
		}
		.top {
			justify-content: space-between;
		}
		.mobile-logo {
			display: block;
		}
		.mobile-logo:hover {
			text-decoration: none;
		}
	}
	@media (max-width: 767px) {
		main {
			padding: 20px 16px;
		}
		.form {
			margin: 24px auto 0;
			padding: 0 0 32px;
		}
	}
</style>
