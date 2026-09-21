import { error } from '@sveltejs/kit';
import { monospace } from '$lib/server/monospace';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const categorySlug = url.searchParams.get('category');

	// Only the active category is needed here — the full list is loaded once by
	// the layout for the category nav.
	const activeCategory = categorySlug
		? ((
				await monospace.categories.readMany({
					fields: ['id', 'name', 'slug'] as const,
					filter: { slug: { _eq: categorySlug } },
					limit: 1
				})
			)[0] ?? null)
		: null;

	if (categorySlug && !activeCategory) {
		error(404, `Category "${categorySlug}" not found`);
	}

	const products = await monospace.products.readMany({
		fields: [
			'id',
			'name',
			'sku',
			'price',
			'description',
			'weight_kg',
			{ categories: ['id', 'name', 'slug'] },
			{ EMPLOYEE: ['emp_no', 'FIRST_NAME', 'last_name'] },
			{ inventory: ['quantity_on_hand'] }
		] as const,
		filter: categorySlug ? { categories: { slug: { _eq: categorySlug } } } : undefined,
		sort: [{ name: { direction: 'asc' } }],
		limit: 100
	});

	return {
		products,
		activeCategory,
		categorySlug
	};
};
