<script lang="ts">
	import type { Snippet } from 'svelte';
	import Illustration, { type IllustrationName } from './Illustration.svelte';

	type Props = { illustration: IllustrationName; title: string; text: string; framed?: boolean; children?: Snippet };
	let { illustration, title, text, framed = true, children }: Props = $props();
</script>

<section class="empty" class:framed>
	<Illustration name={illustration} size={160} />
	<h2>{title}</h2>
	<p>{text}</p>
	{#if children}<div class="actions">{@render children()}</div>{/if}
</section>

<style>
	.empty {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 48px 24px;
		text-align: center;
	}
	.framed {
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		background: var(--color-bg);
	}
	h2 {
		margin-top: 16px;
		font-size: 1.25rem;
		font-weight: 600;
	}
	p {
		max-width: 440px;
		color: var(--color-text-secondary);
		font-size: var(--text-control);
	}
	.actions {
		margin-top: 16px;
	}
</style>
