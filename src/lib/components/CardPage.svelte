<script lang="ts">
	// Public card screens (W04, W05, W08, W13, W14): logo top left, language top right, a centred card.
	import type { Snippet } from 'svelte';
	import LanguageSwitch from './LanguageSwitch.svelte';
	import Logo from './Logo.svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="page">
	<header>
		<a href="/" aria-label="LaunchKit"><Logo /></a>
		<LanguageSwitch />
	</header>
	<main>
		<div class="card">{@render children()}</div>
	</main>
</div>

<style>
	.page {
		min-height: 100vh;
		background: var(--color-surface);
		display: flex;
		flex-direction: column;
	}
	header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 36px 38px 0 64px;
	}
	header a:hover {
		text-decoration: none;
	}
	main {
		flex: 1;
		display: grid;
		place-items: center;
		padding: 40px 16px 80px;
	}
	.card {
		width: min(520px, 100%);
		padding: 40px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-xl);
		background: var(--color-bg);
		display: flex;
		flex-direction: column;
		gap: 12px;
	}
	.card :global(h1) {
		font-size: 1.625rem;
		font-weight: 700;
		line-height: 1.25;
	}
	.card :global(.lead) {
		color: var(--color-text-secondary);
		font-size: var(--text-control);
	}
	@media (max-width: 767px) {
		header {
			padding: 20px 16px 0;
		}
		main {
			padding: 24px 16px 48px;
			place-items: start center;
		}
		.card {
			padding: 28px 20px;
		}
	}
</style>
