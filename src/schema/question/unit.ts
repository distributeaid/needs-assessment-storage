const id = {
	type: 'string',
	minLength: 1,
	description:
		'The id of a unit is used to reference it in the response, but also in JSONata expression, therefore the format is limited to the pattern.',
	pattern: '^[a-z]([a-zA-Z0-9]+)?$',
	examples: ['kg', 'cans', 'epa'],
} as const

const title = {
	type: 'string',
	minLength: 1,
	description: 'The human-readable label for the unit',
	examples: ['Kilogram', 'Cans (#10 kitchen size)', 'Euro pallets'],
} as const

export const unit = {
	type: 'object',
	description: 'Defines a unit for countable items',
	properties: {
		id,
		title,
		baseUnit: {
			type: 'object',
			properties: {
				id,
				title,
				conversionFactor: {
					type: 'number',
					minimum: 0.0000000001,
					description:
						'The factor used to convert the value of this unit into the base unit.',
					examples: [1, 500, 0.2],
				},
			},
			additionalProperties: false,
			required: ['id', 'title', 'conversionFactor'],
		},
	},
	additionalProperties: false,
	required: ['id', 'title'],
}
