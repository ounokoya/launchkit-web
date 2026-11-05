<script lang="ts">
	import '@fontsource-variable/inter';
	import '$lib/styles/tokens.css';
	import '$lib/styles/base.css';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { t } from '$lib/i18n/t';

	let { children } = $props();
	// Marks the page as interactive (used by the end-to-end tests to wait for hydration).
	onMount(() => (document.documentElement.dataset.ready = 'true'));
	// The server writes <html lang>; keep it right when the language changes without a reload (settings form).
	$effect(() => {
		document.documentElement.lang = page.data.locale ?? 'fr';
	});
</script>

<svelte:head>
	<title>LaunchKit</title>
	<meta name="description" content={t('home.hero.subtitle')} />
	<meta property="og:title" content="LaunchKit · {t('home.hero.title')}" />
	<meta property="og:description" content={t('home.hero.subtitle')} />
	<meta property="og:image" content="{page.url.origin}/og-image-{page.data.locale ?? 'fr'}.jpg" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
</svelte:head>

{@render children()}
