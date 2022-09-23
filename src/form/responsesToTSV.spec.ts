import { Static } from '@sinclair/typebox'
import { ulid } from '../ulid'
import { Correction } from './correction'
import { regionQuestion } from './example.form'
import { Form } from './form'
import { responsesToTSV } from './responsesToTSV'
import { Response } from './submission.js'

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
				regionQuestion,
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

type ResponseWithIDAndCorrections = {
	id: string
	response: Static<typeof Response>
	corrections: { id: string; data: Static<typeof Correction> }[]
}

const response1: ResponseWithIDAndCorrections = {
	id: ulid(),
	response: {
		section1: {
			question1: 'Answer 1',
			question2: [1, 'm'],
			region: 'lesvos',
		},
		section2: {
			question1: 'oranges',
			question2: ['apples'],
		},
	},
	corrections: [],
}

const response2: ResponseWithIDAndCorrections = {
	id: ulid(),
	response: {
		section1: {
			question1: 'Answer 2',
			question2: [2, 'm'],
			region: 'lesvos',
		},
		section2: {
			question1: 'apples',
			question2: ['oranges', 'bananas'],
		},
	},
	corrections: [],
}

const tsv = [
	// Header
	[
		`#`,
		`section1.question1`,
		`section1.question2`,
		`section1.question2:unit`,
		`section1.region`,
		`section1.region:id`,
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
		`$meta.version`,
		`$meta.corrections`,
	],
	[
		`Assessment ID`,
		`Section 1: Question 1`,
		`Section 1: Question 2`,
		`Section 1: Question 2 (unit)`,
		`Section 1: What region to you operate in?`,
		`Section 1: What region to you operate in? (id)`,
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
		`Version`,
		`Corrections`,
	],
	// Responses
	[
		response1.id,
		'Answer 1',
		'1',
		'm',
		'Lesvos (Greece)',
		'lesvos',
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
		// Version
		'1',
		// Corrections
		'',
	],
	[
		response2.id,
		'Answer 2',
		'2',
		'm',
		'Lesvos (Greece)',
		'lesvos',
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
		// Version
		'1',
		// Corrections
		'',
	],
]
	.map((line) => line.join('\t'))
	.join('\n')

describe('responsesToTSV()', () => {
	it('should combine multiple responses in one document', () =>
		expect(responsesToTSV(simpleForm, [response1, response2])).toEqual(tsv))

	it('should convert a response with line breaks to CSV (#48)', () =>
		expect(
			responsesToTSV(
				{
					$schema: `https://example.com/form.schema.json`,
					$id: `https://example.com/form/${ulid()}`,
					sections: [
						{
							id: 'section',
							title: 'Test-section',
							questions: [
								{
									id: 'multilineResponse',
									title: 'Multi-line text',
									format: {
										type: 'text',
									},
								},
							],
						},
					],
				},
				[
					{
						id: '01G4A0MY9HG9QD37DVCW60G41T',
						response: {
							section: {
								multilineResponse: [
									'Line 1',
									'Line 2 with "quotes"',
									'Line 3',
								].join('\n'),
							},
						},
						corrections: [],
					},
				],
			),
		).toEqual(
			[
				[
					`#`,
					'section.multilineResponse',
					`$meta.version`,
					`$meta.corrections`,
				],
				[
					`Assessment ID`,
					'Test-section: Multi-line text',
					`Version`,
					`Corrections`,
				],
				[
					'01G4A0MY9HG9QD37DVCW60G41T',
					'"Line 1\nLine 2 with ""quotes""\nLine 3"',
					// Version
					'1',
					// Corrections
					'',
				],
			]
				.map((line) => line.join('\t'))
				.join('\n'),
		))
})
