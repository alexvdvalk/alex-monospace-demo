import { error, fail } from '@sveltejs/kit';
import { monospace } from '$lib/server/monospace';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const projectKey = params.key.toUpperCase();
	const issueNumber = parseInt(params.number, 10);
	if (Number.isNaN(issueNumber)) throw error(400, 'Invalid issue number');

	const projects = await monospace.jira_projects.readMany({
		fields: ['id', 'name', 'key'] as const,
		filter: { key: { _eq: projectKey } },
		limit: 1
	});
	const project = projects[0];
	if (!project) throw error(404, `Project "${projectKey}" not found`);

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
			'updated_at',
			{ comments: ['id', 'author', 'body', 'created_at'] }
		] as const,
		filter: {
			_and: [
				{ project: { key: { _eq: projectKey } } },
				{ issue_number: { _eq: issueNumber } }
			]
		},
		limit: 1
	});

	const issue = issues[0];
	if (!issue) throw error(404, `Issue ${projectKey}-${issueNumber} not found`);

	return { project, issue };
};

export const actions: Actions = {
	update: async ({ request, params }) => {
		const formData = await request.formData();
		const projectKey = params.key.toUpperCase();
		const issueNumber = parseInt(params.number, 10);

		const issues = await monospace.jira_issues.readMany({
			fields: ['id'] as const,
			filter: {
				_and: [
					{ project: { key: { _eq: projectKey } } },
					{ issue_number: { _eq: issueNumber } }
				]
			},
			limit: 1
		});
		const issue = issues[0];
		if (!issue) throw error(404, 'Issue not found');

		const data: Record<string, string | null> = {};
		for (const field of ['status', 'priority', 'type', 'assignee', 'labels', 'due_date']) {
			const val = formData.get(field);
			if (val !== null) {
				data[field] = val.toString().trim() || null;
			}
		}

		const title = formData.get('title');
		if (title !== null) {
			const titleStr = title.toString().trim();
			if (!titleStr) return fail(400, { action: 'update', errors: { title: 'Title cannot be empty' } });
			data.title = titleStr;
		}

		const description = formData.get('description');
		if (description !== null) {
			data.description = description.toString().trim() || null;
		}

		try {
			await monospace.jira_issues.updateOne({
				key: issue.id!,
				data,
				fields: ['id'] as const
			});
		} catch (err) {
			console.error('Failed to update issue:', err);
			return fail(500, { action: 'update', errors: { form: 'Could not update issue.' } });
		}

		return { success: true, action: 'update' };
	},

	comment: async ({ request, params }) => {
		const formData = await request.formData();
		const projectKey = params.key.toUpperCase();
		const issueNumber = parseInt(params.number, 10);
		const author = formData.get('author')?.toString().trim() ?? '';
		const body = formData.get('body')?.toString().trim() ?? '';

		if (!author) return fail(400, { action: 'comment', errors: { author: 'Name is required' }, values: { author, body } });
		if (!body) return fail(400, { action: 'comment', errors: { body: 'Comment cannot be empty' }, values: { author, body } });

		const issues = await monospace.jira_issues.readMany({
			fields: ['id'] as const,
			filter: {
				_and: [
					{ project: { key: { _eq: projectKey } } },
					{ issue_number: { _eq: issueNumber } }
				]
			},
			limit: 1
		});
		const issue = issues[0];
		if (!issue) throw error(404, 'Issue not found');

		try {
			await monospace.jira_comments.createOne({
				data: {
					id: crypto.randomUUID() as `${string}-${string}-${string}-${string}-${string}`,
					issue: { _connect: { key: { id: issue.id! } } },
					author,
					body
				},
				fields: ['id'] as const
			});
		} catch (err) {
			console.error('Failed to add comment:', err);
			return fail(500, { action: 'comment', errors: { form: 'Could not add comment.' }, values: { author, body } });
		}

		return { success: true, action: 'comment' };
	}
};
