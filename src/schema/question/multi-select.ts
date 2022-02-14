export const multiSelectQuestionSchema = {
	type: 'object',
	properties: {
		type: {
			const: 'multi-select',
		},
		options: {
			type: 'array',
			minItems: 1,
			items: {
				type: 'object',
				properties: {
					id: {
						type: 'string',
						minLength: 1,
						description:
							'The id of an option is used to reference it in the response, but also in JSONata expression, therefore the format is limited to the pattern.',
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
			uniqueItemProperties: ['id', 'title'],
		},
	},
	additionalProperties: false,
	required: ['type', 'options'],
} as const
