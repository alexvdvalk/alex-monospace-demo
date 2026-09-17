<script lang="ts">
	import { page } from '$app/state';
	import favicon from '$lib/assets/favicon.svg';
	import './layout.css';

	let { children, data } = $props();

	const categoryParam = $derived(page.url.searchParams.get('category'));
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="description" content="Browse Atlas outdoor gear — camping, cycling, water sports, and more." />
</svelte:head>

<div class="shell">
	<header class="site-header">
		<a href="/" class="brand" data-sveltekit-preload-data="hover">
			<span class="brand-mark" aria-hidden="true"></span>
			<span class="brand-name">Atlas</span>
		</a>
		<p class="brand-tag">Field gear catalog</p>
		<nav class="top-nav" aria-label="Primary">
			<a href="/" class="top-link" class:active={page.url.pathname === '/'}>Catalog</a>
			<a
				href="/dashboard"
				class="top-link"
				class:active={page.url.pathname === '/dashboard'}
				data-sveltekit-preload-data="hover">Sales</a
			>
			<a
				href="/tracker"
				class="top-link"
				class:active={page.url.pathname.startsWith('/tracker')}
				data-sveltekit-preload-data="hover">Tracker</a
			>
		</nav>
	</header>

	{#if page.url.pathname !== '/dashboard' && !page.url.pathname.startsWith('/tracker')}
	<nav class="category-nav" aria-label="Product categories">
		<a
			href="/"
			class="category-chip"
			class:active={!categoryParam}
			data-sveltekit-noscroll
		>
			All
		</a>
		{#each data.categories as category (category.id)}
			<a
				href="/?category={category.slug}"
				class="category-chip"
				class:active={categoryParam === category.slug}
				data-sveltekit-noscroll
			>
				{category.name}
			</a>
		{/each}
	</nav>
	{/if}

	<main class="main">
		{@render children()}
	</main>
</div>

<style>
	.shell {
		max-width: 72rem;
		margin: 0 auto;
		padding: 1.5rem 1.25rem 4rem;
	}

	.site-header {
		display: grid;
		gap: 0.35rem;
		margin-bottom: 1.75rem;
		animation: rise 0.55s ease-out both;
	}

	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		width: fit-content;
	}

	.brand-mark {
		width: 0.85rem;
		height: 0.85rem;
		background: var(--pine);
		clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
		transform: translateY(1px);
	}

	.brand-name {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: clamp(2.75rem, 8vw, 4.5rem);
		line-height: 0.9;
		letter-spacing: -0.04em;
		color: var(--ink);
	}

	.brand-tag {
		margin: 0;
		padding-left: 1.6rem;
		font-size: 0.95rem;
		color: var(--muted);
		letter-spacing: 0.02em;
	}

	.top-nav {
		display: flex;
		gap: 1.25rem;
		padding-left: 1.6rem;
		margin-top: 0.5rem;
	}

	.top-link {
		position: relative;
		font-weight: 600;
		font-size: 0.95rem;
		color: var(--muted);
		transition: color 0.2s ease;
	}

	.top-link:hover {
		color: var(--ink);
	}

	.top-link.active {
		color: var(--pine);
	}

	.top-link.active::after {
		content: '';
		position: absolute;
		left: 0;
		right: 0;
		bottom: -0.25rem;
		height: 2px;
		border-radius: 2px;
		background: var(--pine);
	}

	.category-nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 2rem;
		padding-bottom: 1.25rem;
		border-bottom: 1px solid color-mix(in srgb, var(--mist) 80%, transparent);
		animation: rise 0.55s ease-out 0.08s both;
	}

	.category-chip {
		padding: 0.4rem 0.85rem;
		border: 1px solid var(--mist);
		border-radius: 999px;
		font-size: 0.875rem;
		font-weight: 500;
		color: var(--muted);
		background: color-mix(in srgb, var(--chalk) 70%, transparent);
		transition:
			background 0.2s ease,
			color 0.2s ease,
			border-color 0.2s ease,
			transform 0.2s ease;
	}

	.category-chip:hover {
		color: var(--ink);
		border-color: color-mix(in srgb, var(--pine) 35%, var(--mist));
		transform: translateY(-1px);
	}

	.category-chip.active {
		background: var(--pine);
		border-color: var(--pine);
		color: var(--chalk);
	}

	.main {
		animation: rise 0.55s ease-out 0.14s both;
	}

	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (min-width: 768px) {
		.shell {
			padding: 2.5rem 2rem 5rem;
		}
	}
</style>
