import { countries } from '../../country/countries.js'

export const regionQuestionSchema = {
	type: 'object',
	properties: {
		type: {
			const: 'region',
		},
		regions: {
			type: 'array',
			minItems: 1,
			items: {
				type: 'object',
				properties: {
					id: {
						type: 'string',
						minLength: 1,
						description:
							'The id of a region is used to reference it in the response, but also in JSONata expression, therefore the format is limited to the pattern.',
						pattern: '^[a-z]([a-zA-Z0-9]+)?$',
						examples: ['Calais/Dunkirk', 'Lesvos'],
					},
					locality: {
						type: 'string',
						minLength: 1,
						description: 'Describes the region',
					},
					countryCode: {
						type: 'string',
						enum: [...Object.keys(countries), '00'],
						description:
							'The two-letter ISO country-code of the country. `00` may be used to provide an `other country` option.',
					},
				},
				additionalProperties: false,
				required: ['id', 'locality', 'countryCode'],
			},
			uniqueItemProperties: ['id', 'locality'],
		},
	},
	additionalProperties: false,
	required: ['type', 'regions'],
} as const
