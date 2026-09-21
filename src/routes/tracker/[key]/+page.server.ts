import { error, fail } from '@sveltejs/kit';
import { monospace } from '$lib/server/monospace';
import { isPriority, isType } from '$lib/tracker';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const projects = await monospace.jira_projects.readMany({
		fields: ['id', 'name', 'key', 'description'] as const,
		filter: { key: { _eq: params.key.toUpperCase() } },
		limit: 1
	});

	const project = projects[0];
	if (!project) throw error(404, `Project "${params.key}" not found`);

	const issues = await monospace.jira_issues.readMany({
		fields: [
			'id',
			'issue_number',
			'title',
			'description',
			'type',
			'status',
			'priority',
			'assignee',
			'reporter',
			'labels',
			'due_date',
			'created_at',
			'updated_at'
		] as const,
		filter: { project: { key: { _eq: params.key.toUpperCase() } } },
		sort: [{ issue_number: { direction: 'asc' } }],
		limit: 500
	});

	return { project, issues };
};

export const actions: Actions = {
	create: async ({ request, params }) => {
		const formData = await request.formData();
		const title = formData.get('title')?.toString().trim() ?? '';
		const description = formData.get('description')?.toString().trim() || null;
		const type = formData.get('type')?.toString() ?? 'task';
		const priority = formData.get('priority')?.toString() ?? 'medium';
		const assignee = formData.get('assignee')?.toString().trim() || null;
		const reporter = formData.get('reporter')?.toString().trim() || 'System';
		const labels = formData.get('labels')?.toString().trim() || null;
		const due_date = formData.get('due_date')?.toString() || null;

		const values = { title, description, type, priority, assignee, reporter, labels, due_date };

		const errors: Record<string, string> = {};
		if (!title) errors.title = 'Title is required';
		if (!isType(type)) errors.type = 'Choose a valid type';
		if (!isPriority(priority)) errors.priority = 'Choose a valid priority';

		if (Object.keys(errors).length > 0) {
			return fail(400, { action: 'create', errors, values });
		}

		const projects = await monospace.jira_projects.readMany({
			fields: ['id', 'key'] as const,
			filter: { key: { _eq: params.key.toUpperCase() } },
			limit: 1
		});
		const project = projects[0];
		if (!project) throw error(404, 'Project not found');

		const existing = await monospace.jira_issues.readMany({
			fields: ['issue_number'] as const,
			filter: { project: { key: { _eq: params.key.toUpperCase() } } },
			sort: [{ issue_number: { direction: 'desc' } }],
			limit: 1
		});
		const nextNumber = (existing[0]?.issue_number ?? 0) + 1;

		try {
			await monospace.jira_issues.createOne({
				data: {
					id: crypto.randomUUID() as `${string}-${string}-${string}-${string}-${string}`,
					project: { _connect: { key: { id: project.id! } } },
					issue_number: nextNumber,
					title,
					description,
					type,
					priority,
					assignee,
					reporter,
					labels,
					due_date
				},
				fields: ['id'] as const
			});
		} catch (err) {
			console.error('Failed to create issue:', err);
			return fail(500, { action: 'create', errors: { form: 'Could not create issue.' }, values });
		}

		return { success: true, action: 'create' };
	},

	updateStatus: async ({ request }) => {
		const formData = await request.formData();
		const issueId = formData.get('issue_id')?.toString() ?? '';
		const status = formData.get('status')?.toString() ?? '';

		if (!issueId || !status) return fail(400, { action: 'updateStatus', errors: { form: 'Missing issue or status' } });

		try {
			await monospace.jira_issues.updateOne({
				key: issueId as `${string}-${string}-${string}-${string}-${string}`,
				data: { status },
				fields: ['id'] as const
			});
		} catch (err) {
			console.error('Failed to update status:', err);
			return fail(500, { action: 'updateStatus', errors: { form: 'Could not update status.' } });
		}

		return { success: true, action: 'updateStatus' };
	}
};
