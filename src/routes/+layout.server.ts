import { monospace } from '$lib/server/monospace';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	try {
		const categories = await monospace.categories.readMany({
			fields: ['id', 'name', 'slug'] as const,
			sort: [{ name: { direction: 'asc' } }]
		});
		return { categories };
	} catch (error) {
		// The categories collection lives on a separate datasource; if it is
		// unavailable, keep the rest of the app (e.g. the sales dashboard) usable.
		console.error('Failed to load categories for layout nav:', error);
		return { categories: [] };
	}
};
