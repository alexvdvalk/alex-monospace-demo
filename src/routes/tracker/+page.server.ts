import { fail } from '@sveltejs/kit';
import { monospace } from '$lib/server/monospace';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const projects = await monospace.jira_projects.readMany({
		fields: [
			'id',
			'name',
			'key',
			'description',
			'created_at',
			{ issues: ['id', 'status'] }
		] as const,
		sort: [{ created_at: { direction: 'desc' } }]
	});

	return {
		projects: projects.map((p) => {
			const issues = p.issues?.data ?? [];
			return {
				id: p.id,
				name: p.name,
				key: p.key,
				description: p.description,
				created_at: p.created_at,
				counts: {
					total: issues.length,
					todo: issues.filter((i) => i.status === 'todo').length,
					in_progress: issues.filter((i) => i.status === 'in_progress').length,
					in_review: issues.filter((i) => i.status === 'in_review').length,
					done: issues.filter((i) => i.status === 'done').length
				}
			};
		})
	};
};

export const actions: Actions = {
	create: async ({ request }) => {
		const formData = await request.formData();
		const name = formData.get('name')?.toString().trim() ?? '';
		const key = formData.get('key')?.toString().trim().toUpperCase() ?? '';
		const description = formData.get('description')?.toString().trim() || null;

		const errors: Record<string, string> = {};
		if (!name) errors.name = 'Project name is required';
		if (!key) errors.key = 'Project key is required';
		else if (key.length > 10) errors.key = 'Key must be 10 characters or fewer';
		else if (!/^[A-Z][A-Z0-9]*$/.test(key)) errors.key = 'Key must start with a letter and contain only uppercase letters/numbers';

		if (Object.keys(errors).length > 0) {
			return fail(400, { errors, values: { name, key, description: description ?? '' } });
		}

		try {
			await monospace.jira_projects.createOne({
				data: { id: crypto.randomUUID() as `${string}-${string}-${string}-${string}-${string}`, name, key, description },
				fields: ['id'] as const
			});
		} catch (error) {
			console.error('Failed to create project:', error);
			return fail(500, {
				errors: { form: 'Could not create the project. The key may already be taken.' },
				values: { name, key, description: description ?? '' }
			});
		}

		return { success: true };
	}
};
