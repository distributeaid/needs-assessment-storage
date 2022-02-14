export const textQuestionSchema = {
	type: 'object',
	properties: {
		type: {
			const: 'text',
		},
		maxLength: {
			description: 'Maximum text length',
			type: 'integer',
			minimum: 1,
		},
		multiLine: {
			description: 'Allow mult-line text input',
			type: 'boolean',
		},
	},
	additionalProperties: false,
	required: ['type'],
} as const
