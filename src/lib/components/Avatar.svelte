<script lang="ts">
	import { initials } from '$lib/tracker';

	type Props = {
		name: string | null | undefined;
		size?: 'xs' | 'sm' | 'md' | 'lg';
		/** The dashboard avatars use a gradient instead of flat pine. */
		gradient?: boolean;
		title?: string;
	};

	let { name, size = 'sm', gradient = false, title }: Props = $props();

	const sizes = {
		xs: 'size-[1.3rem] text-[0.55rem]',
		sm: 'size-6 text-[0.6rem]',
		md: 'size-8 text-[0.7rem]',
		lg: 'size-[2.4rem] text-[0.85rem]'
	};
</script>

<span
	{title}
	class="inline-flex shrink-0 items-center justify-center rounded-full font-bold tracking-[0.02em] text-chalk {gradient
		? 'bg-linear-150 from-signal to-pine'
		: 'bg-pine'} {sizes[size]}"
>
	{initials(name)}
</span>
