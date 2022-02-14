import { Static } from '@sinclair/typebox'
import { Response } from './submission.js'

export const exampleResponse: Static<typeof Response> = {
	basicInfo: {
		email: 'm@distributeaid.org',
		organization: 'Distribute Aid',
		region: 'lebanon',
	},
	timeOfYear: {
		quarter: 'q1',
	},
	whomYouServe: {
		peopleofConcern: [1000, 'people'],
		peopleSupportedMonth: [100, 'people'],
		averagePeopleServedMonth: [30, 'servings'],
		populationTrending: 'upwards',
		aidTypes: ['food', 'clothing'],
		clothingDistribution: ['womens'],
		primaryServing: ['women', 'men', 'lgbtqPlus'],
	},
	warehouse: {
		operatesWarehouse: 'yes',
		storageUsage: 'p50',
		winterize: 'december',
		clearedPallets: [100, 'epa'],
		palletIntake: [96, 'epa'],
		features: ['jack', 'forklift'],
		size: [100, 'sqm'],
	},
	foodItems: {
		rice: [10, 'epal'],
		potatoes: [20, 'epal'],
		onions: [30, 'epal'],
	},
	womensClothing: {
		womensJackets: [10, 'items'],
		womensJumpers: [20, 'items'],
	},
	additional: {
		needOtherItems: 'no',
		dontNeedItems: 'yes',
		notNeededItems: 'Test!',
		haveTooMuchItems: 'no',
		fireSafetyEquipment: 'no',
		powerBanks: 'no',
		logoUsage: 'yes',
		needMedicalItems: 'no',
		needElectricalItems: 'no',
	},
}
