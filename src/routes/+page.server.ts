import { monospace } from '$lib/server/monospace';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const categorySlug = url.searchParams.get('category');

	const [products, categories] = await Promise.all([
		monospace.products.readMany({
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
			filter: categorySlug
				? { categories: { slug: { _eq: categorySlug } } }
				: undefined,
			sort: [{ name: { direction: 'asc' } }],
			limit: 100
		}),
		monospace.categories.readMany({
			fields: ['id', 'name', 'slug'] as const
		})
	]);

	const activeCategory = categorySlug
		? (categories.find((c) => c.slug === categorySlug) ?? null)
		: null;

	return {
		products,
		activeCategory,
		categorySlug
	};
};
