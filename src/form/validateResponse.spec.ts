import { ulid } from '../ulid'
import { Form } from './form.js'
import { validateResponse } from './validateResponse'

describe('validateResponse()', () => {
	const simpleForm: Form = {
		$schema: `https://example.com/form.schema.json`,
		$id: `https://example.com/form/${ulid()}`,
		sections: [
			{
				id: 'section1',
				title: 'Section 1',
				questions: [
					{
						id: 'question1',
						title: 'Question 1',
						format: {
							type: 'text',
						},
					},
				],
			},
		],
	}

	it('should validate a submission', () =>
		expect(
			validateResponse({
				form: simpleForm,
				response: {
					section1: {
						question1: 'Answer',
					},
				},
			}),
		).toMatchObject({
			valid: true,
			validation: {
				section1: {
					question1: true,
				},
			},
			sectionValidation: {
				section1: true,
			},
		}))
	it('should return information about an invalid submisstion', () =>
		expect(
			validateResponse({
				form: simpleForm,
				response: {
					section1: {
						question1: '',
					},
				},
			}),
		).toMatchObject({
			valid: false,
			validation: {
				section1: {
					question1: false,
				},
			},
			sectionValidation: {
				section1: false,
			},
		}))
})
