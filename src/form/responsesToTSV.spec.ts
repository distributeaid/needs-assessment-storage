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
		{
			id: 'section2',
			title: 'Section 2',
			questions: [
				{
					id: 'question1',
					title: 'Pick one fruit',
					required: true,
					format: {
						type: 'single-select',
						options: [
							{
								id: 'apples',
								title: 'Apples',
							},
							{
								id: 'oranges',
								title: 'Oranges',
							},
							{
								id: 'bananas',
								title: 'Bananas',
							},
						],
					},
				},
				{
					id: 'question2',
					title: 'Pick multiple fruit',
					required: true,
					format: {
						type: 'multi-select',
						options: [
							{
								id: 'apples',
								title: 'Apples',
							},
							{
								id: 'oranges',
								title: 'Oranges',
							},
							{
								id: 'bananas',
								title: 'Bananas',
							},
						],
					},
				},
			],
		},
		{
			id: 'optional',
			title: 'Optional Questions',
			questions: [
				{
					id: 'name',
					title: 'What is your name?',
					format: {
						type: 'text',
					},
				},
				{
					id: 'height',
					title: 'How tall are you?',
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
				{
					id: 'color',
					title: 'What is your favorite color?',
					format: {
						type: 'single-select',
						options: [
							{
								id: 'black',
								title: 'Black',
							},
							{
								id: 'white',
								title: 'White',
							},
						],
					},
				},
				{
					id: 'fruit',
					title: 'What is your favorite fruit?',
					format: {
						type: 'multi-select',
						options: [
							{
								id: 'apples',
								title: 'Apples',
							},
							{
								id: 'oranges',
								title: 'Oranges',
							},
							{
								id: 'bananas',
								title: 'Bananas',
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
		section2: {
			question1: 'oranges',
			question2: ['apples'],
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
		section2: {
			question1: 'apples',
			question2: ['oranges', 'bananas'],
		},
	},
}

const tsv = [
	// Header
	[
		`#`,
		`section1.question1`,
		`section1.question2`,
		`section1.question2:unit`,
		`section2.question1`,
		`section2.question1:id`,
		`section2.question2`,
		`section2.question2:ids`,
		`optional.name`,
		`optional.height`,
		`optional.height:unit`,
		`optional.color`,
		`optional.color:id`,
		`optional.fruit`,
		`optional.fruit:ids`,
	],
	[
		`Assessment ID`,
		`Section 1: Question 1`,
		`Section 1: Question 2`,
		`Section 1: Question 2 (unit)`,
		`Section 2: Pick one fruit`,
		`Section 2: Pick one fruit (id)`,
		`Section 2: Pick multiple fruit`,
		`Section 2: Pick multiple fruit (ids)`,
		`Optional Questions: What is your name?`,
		`Optional Questions: How tall are you?`,
		`Optional Questions: How tall are you? (unit)`,
		`Optional Questions: What is your favorite color?`,
		`Optional Questions: What is your favorite color? (id)`,
		`Optional Questions: What is your favorite fruit?`,
		`Optional Questions: What is your favorite fruit? (ids)`,
	],
	// Responses
	[
		response1.id,
		'Answer 1',
		'1',
		'm',
		'Oranges',
		'oranges',
		'Apples',
		'apples',
		'',
		'',
		'',
		'',
		'',
		'',
		'',
	],
	[
		response2.id,
		'Answer 2',
		'2',
		'm',
		'Apples',
		'apples',
		'Oranges, Bananas',
		'oranges, bananas',
		'',
		'',
		'',
		'',
		'',
		'',
		'',
	],
]
	.map((line) => line.join('\t'))
	.join('\n')

describe('responsesToTSV()', () => {
	it('should combine multiple responses in one document', () =>
		expect(responsesToTSV(simpleForm, [response1, response2])).toEqual(tsv))
})