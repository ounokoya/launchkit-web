<script lang="ts">
	import { avatarColor, initials } from '$lib/format';

	let { name, id, size = 32 }: { name: string; id: string; size?: number } = $props();
</script>

<span
	class="avatar"
	style:--size="{size}px"
	style:--bg="var(--color-avatar-{avatarColor(id)})"
	aria-hidden="true">{initials(name)}</span
>

<style>
	.avatar {
		display: inline-grid;
		place-items: center;
		flex: none;
		width: var(--size);
		height: var(--size);
		border-radius: 50%;
		background: var(--bg);
		color: #fff;
		font-size: calc(var(--size) * 0.4);
		font-weight: 600;
	}
</style>
