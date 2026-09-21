<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	type Props = HTMLButtonAttributes & {
		variant?: 'primary' | 'secondary' | 'ghost';
		size?: 'sm' | 'md';
		pill?: boolean;
		class?: string;
		children: Snippet;
	};

	let {
		variant = 'secondary',
		size = 'md',
		pill = false,
		type = 'button',
		class: className = '',
		children,
		...rest
	}: Props = $props();

	const sizes = {
		sm: 'px-2 py-1 text-xs',
		md: 'px-4 py-2 text-[0.85rem]'
	};

	const variants = {
		primary: 'border-pine bg-pine text-chalk hover:bg-pine-deep',
		secondary: 'border-mist bg-chalk text-ink hover:border-mist-pine',
		ghost: 'border-mist bg-transparent text-muted hover:border-mist-pine hover:text-ink'
	};
</script>

<button
	{type}
	class="inline-flex cursor-pointer items-center gap-1.5 border font-semibold transition-all duration-150 disabled:cursor-wait disabled:opacity-70 {pill
		? 'rounded-full'
		: 'rounded-lg'} {sizes[size]} {variants[variant]} {className}"
	{...rest}
>
	{@render children()}
</button>
