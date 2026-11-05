<script lang="ts" module>
	// The 7 illustrations of brand/illustrations (style 3 « trait et aplats »), decorative.
	import erreur403 from '$lib/assets/illustrations/erreur-403.svg';
	import erreur404 from '$lib/assets/illustrations/erreur-404.svg';
	import invitation from '$lib/assets/illustrations/invitation.svg';
	import membresVide from '$lib/assets/illustrations/membres-vide.svg';
	import pro from '$lib/assets/illustrations/pro.svg';
	import projetsVide from '$lib/assets/illustrations/projets-vide.svg';
	import verifierEmail from '$lib/assets/illustrations/verifier-email.svg';

	const sources = {
		'erreur-403': erreur403,
		'erreur-404': erreur404,
		invitation,
		'membres-vide': membresVide,
		pro,
		'projets-vide': projetsVide,
		'verifier-email': verifierEmail
	};
	export type IllustrationName = keyof typeof sources;
</script>

<script lang="ts">
	let { name, size = 120 }: { name: IllustrationName; size?: number } = $props();
</script>

<img src={sources[name]} alt="" width={size} height={size} loading="lazy" />
