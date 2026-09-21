<script lang="ts">
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import Chip from '$lib/components/Chip.svelte';
	import './layout.css';

	let { children, data } = $props();

	const categoryParam = $derived(page.url.searchParams.get('category'));

	const navLinks = [
		{ href: '/', label: 'Catalog', match: (path: string) => path === '/' },
		{ href: '/dashboard', label: 'Sales', match: (path: string) => path === '/dashboard' },
		{ href: '/tracker', label: 'Tracker', match: (path: string) => path.startsWith('/tracker') }
	];

	const showCategories = $derived(
		page.url.pathname !== '/dashboard' && !page.url.pathname.startsWith('/tracker')
	);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="description" content="Browse Atlas outdoor gear — camping, cycling, water sports, and more." />
</svelte:head>

<div class="mx-auto max-w-6xl px-5 pt-6 pb-16 md:px-8 md:pt-10 md:pb-20">
	<header class="mb-7 grid animate-rise gap-1.5">
		<a href="/" class="inline-flex w-fit items-center gap-3" data-sveltekit-preload-data="hover">
			<span
				class="size-3.5 translate-y-px bg-pine [clip-path:polygon(50%_0%,100%_100%,0%_100%)]"
				aria-hidden="true"
			></span>
			<span
				class="font-display text-[clamp(2.75rem,8vw,4.5rem)] leading-[0.9] font-extrabold tracking-[-0.04em] text-ink"
			>
				Atlas
			</span>
		</a>
		<p class="m-0 pl-[1.6rem] text-[0.95rem] tracking-[0.02em] text-muted">Field gear catalog</p>
		<nav class="mt-2 flex gap-5 pl-[1.6rem]" aria-label="Primary">
			{#each navLinks as link (link.href)}
				{@const active = link.match(page.url.pathname)}
				<a
					href={link.href}
					data-sveltekit-preload-data="hover"
					class="relative text-[0.95rem] font-semibold transition-colors duration-200 {active
						? 'text-pine after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-sm after:bg-pine after:content-[""]'
						: 'text-muted hover:text-ink'}"
				>
					{link.label}
				</a>
			{/each}
		</nav>
	</header>

	{#if showCategories}
		<nav
			class="mb-8 flex animate-rise flex-wrap gap-2 border-b border-mist/80 pb-5 [animation-delay:80ms]"
			aria-label="Product categories"
		>
			<Chip href="/" active={!categoryParam} data-sveltekit-noscroll>All</Chip>
			{#each data.categories as category (category.id)}
				<Chip
					href="/?category={category.slug}"
					active={categoryParam === category.slug}
					data-sveltekit-noscroll
				>
					{category.name}
				</Chip>
			{/each}
		</nav>
	{/if}

	<main class="animate-rise [animation-delay:140ms]">
		{@render children()}
	</main>
</div>
