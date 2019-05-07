export const schema = {
	type: 'object',
	required: ['name'],
	properties: {
		name: { type: 'string', maxLength: 255, minimum: 1 },
		joinPeriod: { type: 'number' },
		maxSize: { type: 'number' },
	},
};
