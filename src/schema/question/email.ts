export const emailQuestionSchema = {
	type: 'object',
	properties: {
		type: {
			const: 'email',
		},
	},
	additionalProperties: false,
	required: ['type'],
} as const
