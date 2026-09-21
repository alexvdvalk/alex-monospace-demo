<script lang="ts">
	import type { Snippet } from 'svelte';

	type Props = {
		href?: string;
		active?: boolean;
		children: Snippet;
		[key: string]: unknown;
	};

	let { href, active = false, children, ...rest }: Props = $props();

	const chipClass = $derived(
		`cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all duration-200 ${
			active
				? 'border-pine bg-pine text-chalk'
				: 'border-mist bg-chalk/70 text-muted hover:-translate-y-px hover:border-mist-pine hover:text-ink'
		}`
	);
</script>

{#if href}
	<a {href} class={chipClass} {...rest}>{@render children()}</a>
{:else}
	<button type="button" class={chipClass} {...rest}>{@render children()}</button>
{/if}
