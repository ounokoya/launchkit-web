<script lang="ts">
	// FR | EN switch (P5): a plain form, so it works without JavaScript.
	import { page } from '$app/state';
	import Globe from '@lucide/svelte/icons/globe';
	import { currentLocale, t } from '$lib/i18n/t';

	let { compact = false }: { compact?: boolean } = $props();
	const here = $derived(page.url.pathname + page.url.search);
</script>

<form method="POST" action="/lang" class="switch" class:compact aria-label={t('common.a11y.switch_language')}>
	<input type="hidden" name="redirectTo" value={here} />
	{#if !compact}<Globe size={18} aria-hidden="true" />{/if}
	<button name="locale" value="fr" aria-pressed={currentLocale() === 'fr'} lang="fr">FR</button>
	<span aria-hidden="true">|</span>
	<button name="locale" value="en" aria-pressed={currentLocale() === 'en'} lang="en">EN</button>
</form>

<style>
	.switch {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		padding: 6px 10px;
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		background: var(--color-bg);
		color: var(--color-text-secondary);
		font-size: var(--text-caption);
	}
	.compact {
		padding: 3px 8px;
		border-radius: var(--radius-sm);
		font-size: var(--text-tiny);
	}
	button {
		padding: 0;
		border: none;
		background: none;
		color: var(--color-text-secondary);
		font-weight: 500;
		cursor: pointer;
	}
	button[aria-pressed='true'] {
		color: var(--color-primary-500);
		font-weight: 700;
	}
	span {
		color: var(--color-text-muted);
	}
</style>
