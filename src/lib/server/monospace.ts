import { MONOSPACE_API_KEY } from '$env/static/private';
import { createClient } from '../../generated/monospace';

if (!MONOSPACE_API_KEY) {
	throw new Error('MONOSPACE_API_KEY is not set');
}

export const monospace = createClient({
	url: 'https://demo.cloud.monospace.io',
	workspace: 'atlas-innovations',
	apiKey: MONOSPACE_API_KEY
});
