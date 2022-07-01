import { Static } from '@sinclair/typebox'
import { Form } from '../form/form'
import { Response } from '../form/submission'
import { formSchema } from '../schema/form'
import { ulid } from '../ulid'
import { correctionDiff } from './correctionDiff'

describe('correctionDiff()', () => {
	it('should calculate the difference between a submission and a correction', () => {
		const formId = ulid()
		const form$Id = new URL(`https://example.com/form/${formId}`).toString()
		const simpleForm: Form = {
			$schema: formSchema({
				$id: new URL('https://example.com/schema/'),
			}).$id,
			$id: form$Id,
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
								type: 'text',
							},
						},
						{
							id: 'question3',
							title: 'Question 3',
							required: true,
							format: {
								type: 'multi-select',
								options: [],
							},
						},
						{
							id: 'question4',
							title: 'Question 4',
							required: true,
							format: {
								type: 'positive-integer',
								units: [],
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
								type: 'text',
							},
						},
					],
				},
			],
		}

		const submission: Static<typeof Response> = {
			section1: {
				question1: 'Answer 1',
				question2: 'Answer 2',
				question3: ['A', 'B', 'C'],
				question4: [10, 'kg'],
			},
			section2: {
				question1: 'Answer 3',
				question2: 'Answer 4',
			},
		}
		const correction: Static<typeof Response> = {
			section1: {
				question1: 'Answer 1',
				question2: 'Answer 2',
				question3: ['C', 'D'],
				question4: [1, 'pallets'],
			},
			section2: {
				question1: 'Answer 3',
				question2: 'Answer 4 (corrected)',
			},
		}
		expect(correctionDiff(simpleForm, submission, correction)).toMatchObject({
			section1: {
				question3: {
					old: ['A', 'B', 'C'],
					new: ['C', 'D'],
				},
				question4: {
					old: [10, 'kg'],
					new: [1, 'pallets'],
				},
			},
			section2: {
				question2: {
					old: 'Answer 4',
					new: 'Answer 4 (corrected)',
				},
			},
		})
	})
})
