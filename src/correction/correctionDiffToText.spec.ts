import { Form } from '../form/form'
import { formSchema } from '../schema/form'
import { ulid } from '../ulid'
import { correctionDiffToText } from './correctionDiffToText'

describe('correctionDiffToText()', () => {
	it('should convert a correction diff to text (for use in emails)', () => {
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

		expect(
			correctionDiffToText(simpleForm, {
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
			}),
		).toEqual(
			[
				'- Section 1: Question 3',
				'  OLD: A, B, C',
				'  NEW: C, D',
				'',
				'- Section 1: Question 4',
				'  OLD: 10 kg',
				'  NEW: 1 pallets',
				'',
				'- Section 2: Question 2',
				'  OLD: Answer 4',
				'  NEW: Answer 4 (corrected)',
				'',
			].join('\n'),
		)
	})
})
