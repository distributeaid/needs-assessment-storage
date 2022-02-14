import { emailQuestionSchema } from './question/email.js'
import { multiSelectQuestionSchema } from './question/multi-select.js'
import { nonNegativeIntegerQuestionSchema } from './question/non-negative-integer.js'
import { positiveIntegerQuestionSchema } from './question/positive-integer.js'
import { singleSelectQuestionSchema } from './question/single-select.js'
import { textQuestionSchema } from './question/text.js'

export const questionsSchema = {
	type: 'array',
	minItems: 1,
	items: {
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
					textQuestionSchema,
					emailQuestionSchema,
					positiveIntegerQuestionSchema,
					nonNegativeIntegerQuestionSchema,
					singleSelectQuestionSchema,
					multiSelectQuestionSchema,
				],
			},
		},
		additionalProperties: false,
		required: ['id', 'title', 'format'],
	},
	uniqueItemProperties: ['id', 'title'],
} as const
