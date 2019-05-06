export const schema = {
	type: 'object',
	required: ['message'],
	properties: {
		message: { type: 'string', maxLength: 255, minimum: 1 },
		rooms: {
			type: 'array',
			items: { type: 'string' },
		},
	},
};
