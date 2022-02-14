export const nonNegativeIntegerQuestionSchema = {
	type: 'object',
	description: 'A non-negative integer (including 0)',
	examples: [0, 1, 2, 3, 42],
	properties: {
		type: {
			const: 'non-negative-integer',
		},
		min: {
			description: 'Minimum value',
			type: 'integer',
			minimum: 0,
		},
		max: {
			description: 'Maximum value',
			type: 'integer',
			minimum: 0,
		},
		units: {
			description: 'Unit of the value',
			type: 'array',
			minItems: 1,
			items: {
				type: 'object',
				properties: {
					id: {
						type: 'string',
						minLength: 1,
						description:
							'The id of a unit is used to reference it in the response, but also in JSONata expression, therefore the format is limited to the pattern.',
						pattern: '^[a-z]([a-zA-Z0-9]+)?$',
					},
					title: {
						type: 'string',
						minLength: 1,
					},
				},
				additionalProperties: false,
				required: ['id', 'title'],
			},
		},
	},
	additionalProperties: false,
	required: ['type', 'units'],
} as const
