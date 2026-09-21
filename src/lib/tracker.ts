export const statusOptions = ['todo', 'in_progress', 'in_review', 'done'] as const;
export const priorityOptions = ['critical', 'high', 'medium', 'low'] as const;
export const typeOptions = ['task', 'bug', 'story', 'epic'] as const;

export const statusLabels: Record<string, string> = {
	todo: 'To Do',
	in_progress: 'In Progress',
	in_review: 'In Review',
	done: 'Done'
};

export const priorityLabels: Record<string, string> = {
	critical: 'Critical',
	high: 'High',
	medium: 'Medium',
	low: 'Low'
};

export const typeLabels: Record<string, string> = {
	task: 'Task',
	bug: 'Bug',
	story: 'Story',
	epic: 'Epic'
};

export const typeIcon: Record<string, string> = {
	bug: '\u{1F41B}',
	task: '✓',
	story: '\u{1F4D6}',
	epic: '⚡'
};

/** Tailwind background utilities for the priority dot. */
export const priorityDotClass: Record<string, string> = {
	critical: 'bg-flag-critical',
	high: 'bg-flag-high',
	medium: 'bg-flag-medium',
	low: 'bg-flag-low'
};

/** Tailwind border + text utilities for the status badge. */
export const statusBadgeClass: Record<string, string> = {
	todo: 'border-muted text-muted',
	in_progress: 'border-signal text-signal',
	in_review: 'border-flag-epic text-flag-epic',
	done: 'border-pine text-pine'
};

export function initials(name: string | null | undefined): string {
	if (!name) return '?';
	return name
		.split(' ')
		.filter(Boolean)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase())
		.join('');
}

/** Form posts are untrusted: only let known enum values reach the API. */
export function isStatus(value: string): value is (typeof statusOptions)[number] {
	return (statusOptions as readonly string[]).includes(value);
}

export function isPriority(value: string): value is (typeof priorityOptions)[number] {
	return (priorityOptions as readonly string[]).includes(value);
}

export function isType(value: string): value is (typeof typeOptions)[number] {
	return (typeOptions as readonly string[]).includes(value);
}
