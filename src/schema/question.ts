import { URL } from 'url'
import { JSONSchema } from './JSONSchema.js'

export const question = ({
	baseURL,
	version,
}: {
	baseURL: URL
	version: string
}): JSONSchema => {
	const $id = `${new URL(
		`./question.schema.json?version=${encodeURIComponent(version)}`,
		baseURL,
	)}`
	return {
		$schema: 'http://json-schema.org/draft-07/schema#',
		$id,
		title: 'Questions of a section',
		description: 'A section has multiple questions',
		type: 'object',
		properties: {
			id: {
				type: 'string',
				minLength: 1,
				description:
					'The id of a question is used to reference it in the response, but also in JSONata expression, therefore the format is limited to the pattern.',
				pattern: '^[a-z]([a-zA-Z0-9]+)?$',
			},
			title: {
				type: 'string',
				minLength: 1,
			},
			description: {
				description: 'Further explanation of this question.',
				type: 'string',
				minLength: 1,
			},
			example: {
				description: 'An example answer.',
				type: 'string',
				minLength: 1,
			},
			internalComment: {
				description: 'A comment (should not be shown to users).',
				type: 'string',
				minLength: 1,
			},
			required: {
				description:
					'Whether answering this is required, can either be statically disabled, or be a JSONata expression',
				oneOf: [{ type: 'boolean' }, { type: 'string', minLength: 1 }],
				default: true,
			},
			hidden: {
				description:
					'whether to hide this question, can either be statically disabled, or be a JSONata expression',
				oneOf: [{ type: 'boolean' }, { type: 'string', minLength: 1 }],
			},
			format: {
				type: 'object',
				oneOf: [
					{
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
					},
					{
						type: 'object',
						properties: {
							type: {
								const: 'email',
							},
						},
						additionalProperties: false,
						required: ['type'],
					},
					{
						type: 'object',
						description: 'A positive non-zero integer',
						examples: [1, 2, 3, 42],
						properties: {
							type: {
								const: 'positive-integer',
							},
							min: {
								description: 'Minimum value',
								type: 'integer',
								minimum: 1,
							},
							max: {
								description: 'Maximum value',
								type: 'integer',
								minimum: 1,
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
					},
					{
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
					},
					{
						type: 'object',
						properties: {
							type: {
								const: 'single-select',
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
							style: {
								type: 'string',
								enum: ['dropdown', 'radio'],
								description:
									"Style of the single select, defaults to 'dropdown'",
							},
						},
						additionalProperties: false,
						required: ['type', 'options'],
					},
					{
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
					},
				],
			},
		},
		additionalProperties: false,
		required: ['id', 'title', 'format'],
	}
}
