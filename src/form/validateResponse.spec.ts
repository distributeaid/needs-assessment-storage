import { URL } from 'url'
import { ulid } from '../ulid.js'
import { exampleForm } from './example.form.js'
import { exampleResponse } from './example.response.js'
import { Form } from './form.js'
import { validateResponse } from './validateResponse.js'

describe('validateResponse()', () => {
	describe('simple form', () => {
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

		it('should validate a submission', () =>
			expect(
				validateResponse({
					form: simpleForm,
					response: {
						section1: {
							question1: 'Answer',
							question2: [1, 'm'],
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
							question2: [0, 'm'],
						},
					},
				}),
			).toMatchObject({
				valid: false,
				validation: {
					section1: {
						question1: false,
						question2: false,
					},
				},
				sectionValidation: {
					section1: false,
				},
			}))
	})

	describe('full example', () => {
		it('should validate the full example', () =>
			expect(
				validateResponse({
					form: exampleForm({
						$schema: new URL(`https://example.com/form.schema.json`),
						$id: new URL(`https://example.com/form/${ulid()}`),
					}),
					response: exampleResponse,
				}),
			).toMatchObject({
				valid: true,
				validation: {
					basicInfo: {
						email: true,
						organization: true,
						region: true,
						areainfo: true,
					},
					timeOfYear: {
						quarter: true,
					},
					whomYouServe: {
						peopleofConcern: true,
						peopleSupportedMonth: true,
						averagePeopleServedMonth: true,
						populationTrending: true,
						aidTypes: true,
						primaryServing: true,
						clothingDistribution: true,
					},
					warehouse: {
						operatesWarehouse: true,
						size: true,
						storageUsage: true,
						winterize: true,
						clearedPallets: true,
						palletIntake: true,
						features: true,
					},
					foodItems: {
						rice: true,
						potatoes: true,
						onions: true,
						garlic: true,
						flour: true,
						salt: true,
						sugar: true,
						oil: true,
						milk: true,
						cannedTomatoes: true,
						cannedBeans: true,
						cannedFish: true,
						sweetcorn: true,
						tea: true,
						coffee: true,
					},
					womensClothing: {
						womensJackets: true,
						womensJumpers: true,
						womensTShirts: true,
						womensLongSlevedTops: true,
						womensShorts: true,
						womensTrousers: true,
						womensPantsUnderwear: true,
						womensSocks: true,
						womensShoes: true,
						womensHats: true,
						womensScarves: true,
						womensGloves: true,
						womensDresses: true,
						womensLeggings: true,
						womensBras: true,
						womensHijabs: true,
						womensAbayas: true,
					},
					additional: {
						needMedicalItems: true,
						needElectricalItems: true,
						needOtherItems: true,
						dontNeedItems: true,
						notNeededItems: true,
						haveTooMuchItems: true,
						other: true,
						logoUsage: true,
						logoUrl: true,
					},
				},
				sectionValidation: {
					basicInfo: true,
					timeOfYear: true,
					whomYouServe: true,
					warehouse: true,
					foodItems: true,
					womensClothing: true,
					additional: true,
				},
			}))
	})
})
