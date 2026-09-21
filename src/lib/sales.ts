export const callStatusOptions = ['scheduled', 'completed', 'no_show', 'cancelled'] as const;

export const callStatusLabels: Record<string, string> = {
	scheduled: 'Scheduled',
	completed: 'Completed',
	no_show: 'No show',
	cancelled: 'Cancelled'
};

export const callOutcomeLabels: Record<string, string> = {
	interested: 'Interested',
	not_interested: 'Not interested',
	follow_up: 'Follow up',
	closed_won: 'Closed won',
	closed_lost: 'Closed lost'
};

export function isCallStatus(value: string): value is (typeof callStatusOptions)[number] {
	return (callStatusOptions as readonly string[]).includes(value);
}
