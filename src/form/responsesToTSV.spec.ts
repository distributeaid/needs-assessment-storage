import { Static } from '@sinclair/typebox'
import { ulid } from '../ulid'
import { Form } from './form'
import { responsesToTSV } from './responsesToTSV'
import { Response } from './submission'

const id = ulid()
const simpleForm: Form = {
	$schema: `https://example.com/form.schema.json`,
	$id: `https://example.com/form/${id}`,
	sections: [
		{
			id: 'section1',
			title: 'Section 1',
			questions: [
				{
					id: 'question1',
					title: 'Question 1',
					required: true,
					format: {
						type: 'text',
					},
				},
				{
					id: 'question2',
					title: 'Question 2',
					required: true,
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'm',
								title: 'meter',
							},
						],
					},
				},
			],
		},
	],
}

type ResponseWithID = { id: string; response: Static<typeof Response> }

const response1: ResponseWithID = {
	id: ulid(),
	response: {
		section1: {
			question1: 'Answer 1',
			question2: [1, 'm'],
		},
	},
}

const response2: ResponseWithID = {
	id: ulid(),
	response: {
		section1: {
			question1: 'Answer 2',
			question2: [2, 'm'],
		},
	},
}

const tsv = [
	// Header
	[
		`#`,
		`section1.question1`,
		`section1.question1:unit`,
		`section1.question2`,
		`section1.question2:unit`,
	],
	[
		`Assessment ID`,
		`Question 1`,
		`Question 1 (unit)`,
		`Question 2`,
		`Question 2 (unit)`,
	],
	// Responses
	[response1.id, 'Answer 1', '', '1', 'm'],
	[response2.id, 'Answer 2', '', '2', 'm'],
]
	.map((line) => line.join('\t'))
	.join('\n')

describe('responsesToTSV()', () => {
	it('should combine multiple responses in one document', () =>
		expect(responsesToTSV(simpleForm, [response1, response2])).toEqual(tsv))
})
