import { URL } from 'url'
import { Form, Question, Section } from './form.js'

export const regionQuestion: Question = {
	id: 'region',
	title: 'What region to you operate in?',
	required: true,
	format: {
		type: 'region',
		regions: [
			{
				id: 'calais',
				locality: 'Calais/Dunkirk',
				countryCode: 'FR',
			},
			{
				id: 'paris',
				locality: 'Paris',
				countryCode: 'FR',
			},
			{
				id: 'chios',
				locality: 'Chios',
				countryCode: 'GR',
			},
			{
				id: 'samos',
				locality: 'Samos',
				countryCode: 'GR',
			},
			{
				id: 'lesvos',
				locality: 'Lesvos',
				countryCode: 'GR',
			},
			{
				id: 'northernGreece',
				locality: 'Thessaloniki/Northern Mainland Greece',
				countryCode: 'GR',
			},
			{
				id: 'southernGreece',
				locality: 'Athens/Southern Mainland Greece',
				countryCode: 'GR',
			},
			{
				id: 'beirut',
				locality: 'Beirut',
				countryCode: 'LB',
			},
			{
				id: 'bekka',
				locality: 'Bekka Valley',
				countryCode: 'LB',
			},
			{
				id: 'saida',
				locality: 'Saida',
				countryCode: 'LB',
			},
			{
				id: 'lebanon',
				locality: 'Lebanon other',
				countryCode: 'LB',
			},
			{
				id: 'bosnia',
				locality: 'Bosnia',
				countryCode: 'BA',
			},
			{
				id: 'serbia',
				locality: 'Serbia',
				countryCode: 'RS',
			},
			{
				id: 'ventimiglia',
				locality: 'Ventimiglia',
				countryCode: 'IT',
			},
			{
				id: 'romania',
				locality: 'Romania',
				countryCode: 'RO',
			},
			{
				id: 'other',
				locality: 'Other',
				countryCode: '00',
			},
		],
	},
}

export const timeOfYearSection: Section = {
	id: 'timeOfYear',
	title: 'Time of year',
	questions: [
		{
			id: 'quarter',
			title: 'Which quarter is this needs assessment for?',
			required: true,
			format: {
				type: 'single-select',
				options: [
					{
						id: 'q1',
						title: 'Q1: January, February, March',
					},
					{
						id: 'q2',
						title: 'Q2: April, May, June',
					},
					{
						id: 'q3',
						title: 'Q3: July, August, September',
					},
					{
						id: 'q4',
						title: 'Q4: October, November, December',
					},
				],
			},
		},
	],
}

export const exampleForm = ({
	$schema,
	$id,
}: {
	$schema: URL
	$id: URL
}): Form => ({
	$schema: $schema.toString(),
	$id: $id.toString(),
	sections: [
		{
			id: 'basicInfo',
			title: 'Basic Info',
			questions: [
				{
					id: 'email',
					title: 'Email Address',
					required: true,
					format: {
						type: 'email',
					},
					example: 'alex@distributeaid.org',
				},
				{
					id: 'organization',
					title: 'Organisation Name',
					required: true,
					format: {
						type: 'text',
					},
				},
				regionQuestion,
				{
					id: 'areainfo',
					title:
						'Would you like to tell us the exact area that you operate in?',
					format: {
						type: 'text',
						maxLength: 180,
					},
				},
			],
		},
		timeOfYearSection,
		{
			id: 'whomYouServe',
			title: 'Whom you serve',
			questions: [
				{
					id: 'peopleofConcern',
					title:
						'How many people total are there in your region who may access NGO services?',
					description:
						'e.g. total number of people living in an RIC and apartments ',
					required: true,
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'people',
								title: 'people of concern',
							},
						],
					},
				},
				{
					id: 'peopleSupportedMonth',
					title:
						'How many unique people does your organisation support in one month?',
					description:
						'This is the number of individuals you support; if you serve the same person multiple times in a month, please do not count them multiple times!',
					required: true,
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'people',
								title: 'unique people',
							},
						],
					},
				},
				{
					id: 'averagePeopleServedMonth',
					title:
						'How many times on average do you serve one person over the course of one month?',
					description:
						'e.g. if you serve the same people one meal a day, you would serve an individual 30 times a month.',
					required: true,
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'servings',
								title: 'average servings/month',
							},
						],
					},
				},
				{
					id: 'populationTrending',
					title:
						'Is the number of people you support trending upwards, downwards, steady/consistent, or hard to say?',
					required: true,
					format: {
						type: 'single-select',
						options: [
							{
								id: 'upwards',
								title: 'upwards',
							},
							{
								id: 'downwards',
								title: 'downwards',
							},
							{
								id: 'steady',
								title: 'steady/consistent',
							},
							{
								id: 'hardToSay',
								title: 'hard to say',
							},
						],
					},
				},
				{
					id: 'aidTypes',
					title:
						'Which of the following types of aid does your organisation provide? Please select all that apply',
					internalComment:
						'if clothing is selected, this triggers the question `clothing-distribution` about which types of clothing',
					required: true,
					format: {
						type: 'multi-select',
						options: [
							{
								id: 'food',
								title: 'food items',
							},
							{
								id: 'clothing',
								title: 'clothing',
							},
							{
								id: 'hygiene',
								title: 'hygiene (including diapers)',
							},
							{
								id: 'shelter',
								title: 'Shelter and Storage',
							},
							{
								id: 'education',
								title: 'education and employability services',
							},
							{
								id: 'medical',
								title: 'medical services',
							},
						],
					},
				},
				{
					id: 'primaryServing',
					title: 'Whom do you primarily serve? Pease select all that apply',
					required: true,
					format: {
						type: 'multi-select',
						options: [
							{
								id: 'men',
								title: 'men',
							},
							{
								id: 'women',
								title: 'women',
							},
							{
								id: 'children',
								title: 'children',
							},
							{
								id: 'unaccompaniedMinoris',
								title: 'unaccompanied minors',
							},
							{
								id: 'families',
								title: 'families',
							},
							{
								id: 'disabled',
								title: 'disabled',
							},
							{
								id: 'lgbtqPlus',
								title: 'LGBTQ+',
							},
							{
								id: 'vulnerable',
								title: 'Vulnerable Cases',
							},
						],
					},
				},
				{
					id: 'clothingDistribution',
					title:
						'Which types of the following clothing does your organisation distribute? Please select all that apply',
					required: "'clothing' in whomYouServe.aidTypes",
					hidden: "$not('clothing' in whomYouServe.aidTypes)",
					internalComment:
						'only display if clothing selected on `aid-types` and make this question required. Each answer choice triggers a page for needs data about that type of clothing if selected.',
					format: {
						type: 'multi-select',
						options: [
							{
								id: 'womens',
								title: "Women's clothing",
							},
							{
								id: 'mens',
								title: "men's clothing",
							},
							{
								id: 'girls',
								title: "girl's clothing",
							},
							{
								id: 'boys',
								title: "boy's clothing",
							},
							{
								id: 'baby',
								title: 'baby clothing',
							},
						],
					},
				},
			],
		},
		{
			id: 'warehouse',
			title: 'Warehouse information',
			questions: [
				{
					id: 'operatesWarehouse',
					title: 'Do you operate a warehouse?',
					required: true,
					format: {
						type: 'single-select',
						style: 'radio',
						options: [
							{
								id: 'yes',
								title: 'yes',
							},
							{
								id: 'no',
								title: 'no',
							},
						],
					},
				},
				{
					id: 'size',
					title: 'What is the size of your warehouse, in square meters (m²)?',
					required: "warehouse.operatesWarehouse = 'yes'",
					hidden: "warehouse.operatesWarehouse = 'no'",
					format: {
						type: 'non-negative-integer',
						units: [
							{
								id: 'sqm',
								title: 'm²',
							},
						],
					},
				},
				{
					id: 'warehouseInfo',
					title: 'Please tell us about your storage solutions:',
					required:
						"(warehouse.operatesWarehouse = 'yes' and warehouse.size[0] = 0) or warehouse.operatesWarehouse = 'no'",
					hidden: 'warehouse.size[0] > 0',
					format: {
						type: 'text',
						multiLine: true,
					},
				},
				{
					id: 'storageUsage',
					title: 'How full is your storage?',
					required: true,
					format: {
						type: 'single-select',
						options: [
							{
								id: 'p100',
								title: '100%',
							},
							{
								id: 'p75',
								title: '75%',
							},
							{
								id: 'p50',
								title: '50%',
							},
							{
								id: 'p25',
								title: '25%',
							},
							{
								id: 'p0',
								title: '0%',
							},
						],
					},
				},
				{
					id: 'winterize',
					title: 'In which month do you winterise your warehouse?',
					required: true,
					format: {
						type: 'single-select',
						options: [
							{
								id: 'january',
								title: 'January',
							},
							{
								id: 'february',
								title: 'February',
							},
							{
								id: 'march',
								title: 'March',
							},
							{
								id: 'april',
								title: 'April',
							},
							{
								id: 'may',
								title: 'May',
							},
							{
								id: 'june',
								title: 'June',
							},
							{
								id: 'july',
								title: 'July',
							},
							{
								id: 'august',
								title: 'August',
							},
							{
								id: 'september',
								title: 'September',
							},
							{
								id: 'october',
								title: 'October',
							},
							{
								id: 'november',
								title: 'November',
							},
							{
								id: 'december',
								title: 'December',
							},
							{
								id: 'never',
								title: "I don't winterize my warehouse",
							},
						],
					},
				},
				{
					id: 'clearedPallets',
					title:
						'How many pallets do you typically clear (i.e. go through or use) each month?',
					required: true,
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'epa',
								title: 'Euro pallets',
							},
						],
					},
				},
				{
					id: 'palletIntake',
					title:
						'How many pallets per month is your warehouse typically able to take in?',
					required: true,
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'epa',
								title: 'Euro pallets',
							},
						],
					},
				},
				{
					id: 'features',
					title: 'Please tick all that you have access to',
					format: {
						type: 'multi-select',
						options: [
							{
								id: 'forklift',
								title: 'Fork lift',
							},
							{
								id: 'jack',
								title: 'Pallet Jack',
							},
							{
								id: 'van',
								title: 'Van',
							},
							{ id: 'loadingBay', title: 'Loading Bay' },
							{ id: 'loadingRamp', title: 'Loading Ramp' },
							{ id: 'parking40ftTruck', title: 'Parking for a 40ft Truck' },
						],
					},
				},
			],
		},
		{
			id: 'hygieneItems',
			title: 'Hygiene items',
			hidden: "$not('hygiene' in whomYouServe.aidTypes)",
			description:
				'How many hygiene items do you need for the quarter? Remember, please do not include a need if you already have those items on hand or have a confirmed donation of those items in the quarter.',
			internalComment:
				"This set of questions should only appear to the survey taker if they checked the corresponding box on the 'Whom you serve' section",
			questions: [
				{
					id: 'clothMasks',
					title: 'Cloth Masks',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'masks',
								title: 'Individual Masks',
							},
						],
					},
				},
				{
					id: 'surgicalMasks',
					title: 'Surgical Style Masks',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'masks',
								title: 'Individual Masks',
							},
						],
					},
				},
				{
					id: 'n95Ffp2Masks',
					title: 'N95/FFP2 Masks',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'masks',
								title: 'Individual Masks',
							},
						],
					},
				},
				{
					id: 'barSoap',
					title: 'Bar Soap',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'bars100g',
								title: '100g Bars',
							},
						],
					},
				},
				{
					id: 'liquidSoap',
					title: 'Liquid Soap',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'bottles250ml',
								title: '250ml Bottles',
							},
						],
					},
				},
				{
					id: 'shampoo',
					title: 'Shampoo',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'bottles250ml',
								title: '250ml Bottles',
							},
						],
					},
				},
				{
					id: 'toothbrushes',
					title: 'Toothbrushes',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'toothbrushes',
								title: 'Individual Toothbrushes',
							},
						],
					},
				},
				{
					id: 'toothpaste',
					title: 'Toothpaste',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'tubes100ml',
								title: '100ml Tube',
							},
						],
					},
				},
				{
					id: 'sanitaryPadsReusable',
					title: 'Reusable Sanitary Pads',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'pads',
								title: 'Individual Pads',
							},
						],
					},
				},
				{
					id: 'sanitaryPadsDisposable',
					title: 'Disposable Sanitary Pads',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'pads',
								title: 'Individual Pads',
							},
						],
					},
				},
				{
					id: 'deodorant',
					title: 'Deodorant',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'rollers100ml',
								title: '100ml Roller',
							},
						],
					},
				},
				{
					id: 'disposableRazors',
					title: 'Disposable Razors',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'razors',
								title: 'Individual Razors',
							},
						],
					},
				},
				{
					id: 'shavingFoam',
					title: 'Shaving Foam',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'cans200ml',
								title: '200ml Cans',
							},
						],
					},
				},
				{
					id: 'condoms',
					title: 'Condoms',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'condoms',
								title: 'Individual Condoms',
							},
						],
					},
				},
				{
					id: 'diapersSize0',
					title: 'Diapers - Size 0',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'diapersSize0',
								title: 'Individual Diapers',
							},
						],
					},
				},
				{
					id: 'diapersSize1',
					title: 'Diapers - Size 1',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'diapersSize1',
								title: 'Individual Diapers',
							},
						],
					},
				},
				{
					id: 'diapersSize2',
					title: 'Diapers - Size 2',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'diapersSize2',
								title: 'Individual Diapers',
							},
						],
					},
				},
				{
					id: 'diapersSize3',
					title: 'Diapers - Size 3',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'diapersSize3',
								title: 'Individual Diapers',
							},
						],
					},
				},
				{
					id: 'diapersSize4',
					title: 'Diapers - Size 4',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'diapersSize4',
								title: 'Individual Diapers',
							},
						],
					},
				},
				{
					id: 'diapersSize5',
					title: 'Diapers - Size 5',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'diapersSize5',
								title: 'Individual Diapers',
							},
						],
					},
				},
				{
					id: 'diapersSize6',
					title: 'Diapers - Size 6',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'diapersSize6',
								title: 'Individual Diapers',
							},
						],
					},
				},
				{
					id: 'adultDiapers',
					title: 'Adult Diapers',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'diapersSize6',
								title: 'Individual Diapers',
							},
						],
					},
				},
				{
					id: 'washingDetergent',
					title: 'Washing Detergent',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'bottle1l',
								title: '1L bottle',
							},
							{
								id: 'bag5k',
								title: '5k bag',
							},
						],
					},
				},
				{
					id: 'bleach',
					title: 'Bleach',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'bottle1l',
								title: '1L bottle',
							},
						],
					},
				},
			],
		},
		{
			id: 'shelter',
			title: 'Shelter and Storage',
			description:
				'How many shelter and storage items do you need for the quarter? Remember, please do not include a need if you already have those items on hand or have a confirmed donation of those items in the quarter.',
			hidden: "$not('shelter' in whomYouServe.aidTypes)",
			questions: [
				{
					id: 'tents',
					title: 'Tents',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'tarps',
					title: 'Tarps',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'sleepingBags',
					title: 'Sleeping Bags',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'blankets',
					title: 'Blankets',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'backpacks',
					title: 'Backpacks',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'suitcases',
					title: 'Suitcases',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
			],
		},
		{
			id: 'education',
			title: 'Education and Employability Services',
			description:
				'How many educational material items do you need for the quarter? Remember, please do not include a need if you already have those items on hand or have a confirmed donation of those items in the quarter.',
			hidden: "$not('education' in whomYouServe.aidTypes)",
			questions: [
				{
					id: 'notepads',
					title: 'Notepads',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'pens',
					title: 'Pens',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'pencils',
					title: 'Pencils',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'pencilSharpeners',
					title: 'Pencil Sharpners',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'erasers',
					title: 'Erasers',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'printerPaper',
					title: 'Printer Paper',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'packs',
								title: 'Packs of 500 sheets',
							},
						],
					},
				},
			],
		},
		{
			id: 'foodItems',
			title: 'Food items',
			description:
				'How many food items do you need for the quarter? Remember, please do not include a need if you already have those items on hand or have a confirmed donation of those items in the quarter.',
			hidden: "$not('food' in whomYouServe.aidTypes)",
			questions: [
				{
					id: 'rice',
					title: 'Rice',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'epal',
								title: 'Euro pallets',
							},
							{
								id: 'kg',
								title: 'Kilogram',
							},
						],
					},
				},
				{
					id: 'potatoes',
					title: 'Potatoes',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'epal',
								title: 'Euro pallets',
							},
							{
								id: 'kg',
								title: 'Kilogram',
							},
						],
					},
				},
				{
					id: 'onions',
					title: 'Onions',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'epal',
								title: 'Euro pallets',
							},
							{
								id: 'kg',
								title: 'Kilogram',
							},
						],
					},
				},
				{
					id: 'garlic',
					title: 'Garlic',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'epal',
								title: 'Euro pallets',
							},
							{
								id: 'kg',
								title: 'Kilogram',
							},
						],
					},
				},
				{
					id: 'flour',
					title: 'Flour',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'epal',
								title: 'Euro pallets',
							},
							{
								id: 'kg',
								title: 'Kilogram',
							},
						],
					},
				},
				{
					id: 'salt',
					title: 'Salt',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'epal',
								title: 'Euro pallets',
							},
							{
								id: 'kg',
								title: 'Kilogram',
							},
						],
					},
				},
				{
					id: 'sugar',
					title: 'Sugar',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'epal',
								title: 'Euro pallets',
							},
							{
								id: 'kg',
								title: 'Kilogram',
							},
						],
					},
				},
				{
					id: 'oil',
					title: 'Oil',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'epal',
								title: 'Euro pallets',
							},
							{
								id: 'l',
								title: 'Liter',
							},
						],
					},
				},
				{
					id: 'milk',
					title: 'Milk',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'epal',
								title: 'Euro pallets',
							},
							{
								id: 'l',
								title: 'Liter',
							},
						],
					},
				},
				{
					id: 'cannedTomatoes',
					title: 'Canned Tomatoes',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'epal',
								title: 'Euro pallets',
							},
							{
								id: 'cans',
								title: 'Cans (#10 kitchen size)',
							},
						],
					},
				},
				{
					id: 'cannedBeans',
					title: 'Canned Beans',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'epal',
								title: 'Euro pallets',
							},
							{
								id: 'cans',
								title: 'Cans (#10 kitchen size)',
							},
						],
					},
				},
				{
					id: 'cannedFish',
					title: 'Canned Fish',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'epal',
								title: 'Euro pallets',
							},
							{
								id: 'cans',
								title: 'Cans (#10 kitchen size)',
							},
						],
					},
				},
				{
					id: 'sweetcorn',
					title: 'Sweetcorn',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'epal',
								title: 'Euro pallets',
							},
							{
								id: 'cans',
								title: 'Cans (#10 kitchen size)',
							},
						],
					},
				},
				{
					id: 'tea',
					title: 'Tea',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'epal',
								title: 'Euro pallets',
							},
							{
								id: 'kg',
								title: 'Kilogram',
							},
							{
								id: 'servings',
								title: 'servings',
							},
						],
					},
				},
				{
					id: 'coffee',
					title: 'Coffee',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'epal',
								title: 'Euro pallets',
							},
							{
								id: 'kg',
								title: 'Kilogram',
							},
							{
								id: 'servings',
								title: 'servings',
							},
						],
					},
				},
			],
		},
		{
			id: 'womensClothing',
			title: "Women's clothing",
			description:
				'How many do you need for the selected quarter? Remember, please do not include a need if you already have those items on hand or have a confirmed donation of those items in the selected quarter.',
			internalComment:
				"This set of questions should only appear to the survey taker if they checked the corresponding box on the 'Whom you serve' section",
			hidden: "$not('womens' in whomYouServe.clothingDistribution)",
			questions: [
				{
					id: 'womensJackets',
					title: "Women's Jackets",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'womensJumpers',
					title: "Women's Jumpers",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'womensTShirts',
					title: "Women's T-Shirts",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'womensLongSlevedTops',
					title: "Women's Long sleeved tops",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'womensShorts',
					title: "Women's Shorts",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'womensTrousers',
					title: "Women's Trousers",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'womensPantsUnderwear',
					title: "Women's Pants/Underwear",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'womensSocks',
					title: "Women's Socks",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'womensShoes',
					title: "Women's Shoes",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'pairs',
								title: 'Pairs',
							},
						],
					},
				},
				{
					id: 'womensHats',
					title: "Women's Hats",
					internalComment: 'Q1 and Q4 only',
					hidden: "timeOfYear.quarter = 'q2' or timeOfYear.quarter = 'q3'",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'womensScarves',
					title: "Women's Scarves",
					internalComment: 'Q1 and Q4 only',
					hidden: "timeOfYear.quarter = 'q2' or timeOfYear.quarter = 'q3'",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'womensGloves',
					title: "Women's Gloves",
					internalComment: 'Q1 and Q4 only',
					hidden: "timeOfYear.quarter = 'q2' or timeOfYear.quarter = 'q3'",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'pairs',
								title: 'Pairs',
							},
						],
					},
				},
				{
					id: 'womensDresses',
					title: "Women's Dresses",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'womensLeggings',
					title: "Women's Leggings",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'womensBras',
					title: "Women's Bras",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'womensHijabs',
					title: "Women's Hijabs",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'womensAbayas',
					title: "Women's Abayas",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
			],
		},
		{
			id: 'mensClothing',
			title: "Men's clothing",
			description:
				'How many do you need for the selected quarter? Remember, please do not include a need if you already have those items on hand or have a confirmed donation of those items in the selected quarter.',
			hidden: "$not('mens' in whomYouServe.clothingDistribution)",
			internalComment:
				"This set of questions should only appear to the survey taker if they checked the corresponding box on the 'Whom you serve' section",
			questions: [
				{
					id: 'mensJackets',
					title: "Men's Jackets",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'mensJumpers',
					title: "Men's Jumpers",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'mensTShirts',
					title: "Men's T-Shirts",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'mensLongSlevedTops',
					title: "Men's Long sleeved tops",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'mensShorts',
					title: "Men's Shorts",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'mensTrousers',
					title: "Men's Trousers",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'mensPantsUnderwear',
					title: "Men's Pants/Underwear",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'mensSocks',
					title: "Men's Socks",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'mensShoes',
					title: "Men's Shoes",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'pairs',
								title: 'Pairs',
							},
						],
					},
				},
				{
					id: 'mensHats',
					title: "Men's Hats",
					internalComment: 'Q1 and Q4 only',
					hidden: "timeOfYear.quarter = 'q2' or timeOfYear.quarter = 'q3'",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'mensScarves',
					title: "Men's Scarves",
					internalComment: 'Q1 and Q4 only',
					hidden: "timeOfYear.quarter = 'q2' or timeOfYear.quarter = 'q3'",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'mensGloves',
					title: "Men's Gloves",
					internalComment: 'Q1 and Q4 only',
					hidden: "timeOfYear.quarter = 'q2' or timeOfYear.quarter = 'q3'",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'pairs',
								title: 'Pairs',
							},
						],
					},
				},
			],
		},
		{
			id: 'girlsClothing',
			title: "Girl's clothing",
			description:
				'How many do you need for the selected quarter? Remember, please do not include a need if you already have those items on hand or have a confirmed donation of those items in the selected quarter.',
			hidden: "$not('girls' in whomYouServe.clothingDistribution)",
			internalComment:
				"This set of questions should only appear to the survey taker if they checked the corresponding box on the 'Whom you serve' section",
			questions: [
				{
					id: 'girlsJackets',
					title: "Girl's Jackets",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'girlsJumpers',
					title: "Girl's Jumpers",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'girlsTShirts',
					title: "Girl's T-Shirts",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'girlsLongSlevedTops',
					title: "Girl's Long sleeved tops",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'girlsShorts',
					title: "Girl's Shorts",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'girlsTrousers',
					title: "Girl's Trousers",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'girlsPantsUnderwear',
					title: "Girl's Pants/Underwear",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'girlsSocks',
					title: "Girl's Socks",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'girlsShoes',
					title: "Girl's Shoes",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'pairs',
								title: 'Pairs',
							},
						],
					},
				},
				{
					id: 'girlsHats',
					title: "Girl's Hats",
					internalComment: 'Q1 and Q4 only',
					hidden: "timeOfYear.quarter = 'q2' or timeOfYear.quarter = 'q3'",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'girlsScarves',
					title: "Girl's Scarves",
					internalComment: 'Q1 and Q4 only',
					hidden: "timeOfYear.quarter = 'q2' or timeOfYear.quarter = 'q3'",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'girlsGloves',
					title: "Girl's Gloves",
					internalComment: 'Q1 and Q4 only',
					hidden: "timeOfYear.quarter = 'q2' or timeOfYear.quarter = 'q3'",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'pairs',
								title: 'Pairs',
							},
						],
					},
				},
				{
					id: 'girlsDresses',
					title: "Girl's Dresses",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'girlsLeggings',
					title: "Girl's Leggings",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
			],
		},
		{
			id: 'boysClothing',
			title: "Boy's clothing",
			description:
				'How many do you need for the selected quarter? Remember, please do not include a need if you already have those items on hand or have a confirmed donation of those items in the selected quarter.',
			hidden: "$not('boys' in whomYouServe.clothingDistribution)",
			internalComment:
				"This set of questions should only appear to the survey taker if they checked the corresponding box on the 'Whom you serve' section",
			questions: [
				{
					id: 'boysJackets',
					title: "Boy's Jackets",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'boysJumpers',
					title: "Boy's Jumpers",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'boysTShirts',
					title: "Boy's T-Shirts",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'boysLongSlevedTops',
					title: "Boy's Long sleeved tops",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'boysShorts',
					title: "Boy's Shorts",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'boysTrousers',
					title: "Boy's Trousers",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'boysPantsUnderwear',
					title: "Boy's Pants/Underwear",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'boysSocks',
					title: "Boy's Socks",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'boysShoes',
					title: "Boy's Shoes",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'pairs',
								title: 'Pairs',
							},
						],
					},
				},
				{
					id: 'boysHats',
					title: "Boy's Hats",
					internalComment: 'Q1 and Q4 only',
					hidden: "timeOfYear.quarter = 'q2' or timeOfYear.quarter = 'q3'",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'boysScarves',
					title: "Boy's Scarves",
					internalComment: 'Q1 and Q4 only',
					hidden: "timeOfYear.quarter = 'q2' or timeOfYear.quarter = 'q3'",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'boysGloves',
					title: "Boy's Gloves",
					internalComment: 'Q1 and Q4 only',
					hidden: "timeOfYear.quarter = 'q2' or timeOfYear.quarter = 'q3'",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'pairs',
								title: 'Pairs',
							},
						],
					},
				},
			],
		},
		{
			id: 'babyClothing',
			title: 'Baby clothing',
			description:
				'How many do you need for the selected quarter? Remember, please do not include a need if you already have those items on hand or have a confirmed donation of those items in the selected quarter.',
			hidden: "$not('baby' in whomYouServe.clothingDistribution)",
			internalComment:
				"This set of questions should only appear to the survey taker if they checked the corresponding box on the 'Whom you serve' section",
			questions: [
				{
					id: 'babyJackets',
					title: 'Baby Jackets/All-In-Ones',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'babyJumpers',
					title: 'Baby Jumpers',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'babyTShirts',
					title: 'Baby T-Shirts',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'babyShorts',
					title: 'Baby Shorts',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'babyBodies',
					title: 'Baby Bodies/Rompers',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'babyOnesies',
					title: 'Baby Onesies/pyjamas',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'babySocks',
					title: 'Baby Socks',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'babyShoes',
					title: 'Baby Shoes',
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'pairs',
								title: 'Pairs',
							},
						],
					},
				},
				{
					id: 'babyHats',
					title: 'Baby Hats',
					internalComment: 'Q1 and Q4 only',
					hidden: "timeOfYear.quarter = 'q2' or timeOfYear.quarter = 'q3'",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'items',
								title: 'Individual Items',
							},
						],
					},
				},
				{
					id: 'babyGloves',
					title: 'Baby Gloves',
					internalComment: 'Q1 and Q4 only',
					hidden: "timeOfYear.quarter = 'q2' or timeOfYear.quarter = 'q3'",
					format: {
						type: 'positive-integer',
						units: [
							{
								id: 'pairs',
								title: 'Pairs',
							},
						],
					},
				},
			],
		},
		{
			id: 'additional',
			title: 'Additional Information',
			internalComment:
				"The questions in this section may change for each round. This is a section for us to ask exploratory questions about things we think of that would be good to have data on; the inclusion of questions about them is purely exploratory and doesn't necessarily mean we plan to try to procure or encourage others to procure them. So the utility of asking about the same thing twice isn't that great, and we'll usually have different items we want to ask about each round.",
			questions: [
				{
					id: 'needMedicalItems',
					title: 'Do you have any need for medical products?',
					required: true,
					format: {
						type: 'single-select',
						style: 'radio',
						options: [
							{
								id: 'yes',
								title: 'yes',
							},
							{
								id: 'no',
								title: 'no',
							},
						],
					},
				},
				{
					id: 'medicalItemsNeeded',
					title: 'Please describe the medical products you need:',
					hidden:
						"$not($exists(additional.needMedicalItems)) or additional.needMedicalItems = 'no'",
					required: "additional.needMedicalItems = 'yes'",
					format: {
						type: 'text',
						multiLine: true,
					},
				},
				{
					id: 'needElectricalItems',
					title: 'Do you have any need for electrical products?',
					required: true,
					format: {
						type: 'single-select',
						style: 'radio',
						options: [
							{
								id: 'yes',
								title: 'yes',
							},
							{
								id: 'no',
								title: 'no',
							},
						],
					},
				},
				{
					id: 'electricalItemsNeeded',
					title: 'Please describe the electrical products you need:',
					hidden:
						"$not($exists(additional.needElectricalItems)) or additional.needElectricalItems = 'no'",
					required: "additional.needElectricalItems = 'yes'",
					format: {
						type: 'text',
						multiLine: true,
					},
				},
				{
					id: 'needOtherItems',
					title: 'Are there any other items you need?',
					required: true,
					format: {
						type: 'single-select',
						style: 'radio',
						options: [
							{
								id: 'yes',
								title: 'yes',
							},
							{
								id: 'no',
								title: 'no',
							},
						],
					},
				},
				{
					id: 'otherItemsNeeded',
					title: 'Please describe the other items you need:',
					hidden:
						"$not($exists(additional.needOtherItems)) or additional.needOtherItems = 'no'",
					required: "additional.needOtherItems = 'yes'",
					format: {
						type: 'text',
						multiLine: true,
					},
				},
				{
					id: 'dontNeedItems',
					title:
						'Is there anything you do NOT need more of that you would like to make us aware of?',
					required: true,
					format: {
						type: 'single-select',
						style: 'radio',
						options: [
							{
								id: 'yes',
								title: 'yes',
							},
							{
								id: 'no',
								title: 'no',
							},
						],
					},
				},
				{
					id: 'notNeededItems',
					title: 'Please describe the items you do NOT need anymore:',
					hidden:
						"$not($exists(additional.dontNeedItems)) or additional.dontNeedItems = 'no'",
					required: "additional.dontNeedItems = 'yes'",
					format: {
						type: 'text',
						multiLine: true,
					},
				},
				{
					id: 'haveTooMuchItems',
					title:
						'Is there anything that you have too much of that could be reallocated or traded to other groups?',
					required: true,
					format: {
						type: 'single-select',
						style: 'radio',
						options: [
							{
								id: 'yes',
								title: 'yes',
							},
							{
								id: 'no',
								title: 'no',
							},
						],
					},
				},
				{
					id: 'tooMuchItems',
					title:
						'Please describe the items you have too much of and which could be reallocated or traded to other groups:',
					hidden:
						"$not($exists(additional.haveTooMuchItems)) or additional.haveTooMuchItems = 'no'",
					required: "additional.haveTooMuchItems = 'yes'",
					format: {
						type: 'text',
						multiLine: true,
					},
				},
				{
					id: 'other',
					title:
						'Is there anything else you would like to communicate with us at this time?',
					format: {
						type: 'text',
						multiLine: true,
					},
				},
				{
					id: 'logoUsage',
					title:
						"Thank you for your time! If you'd like, we'll be highlighting some of the organisations that filled out the needs assessment in recognition of the important work being done by grassroots organisations. Your data will not be tied to you publicly. Instead we may, for example, put your organisation's name and logo on the report. If you do not opt in, we will not do this.  If you are the only organisation to respond from your region, we will not do this.  Do you give us permission to highlight your contribution by putting your name and logo on the report?",
					required: true,
					format: {
						type: 'single-select',
						style: 'radio',
						options: [
							{
								id: 'yes',
								title: 'yes',
							},
							{
								id: 'no',
								title: 'no',
							},
						],
					},
				},
				{
					id: 'logoUrl',
					title:
						"Feel free to provide the URL to your logo here. Otherwise, we'll pull it off your website.",
					hidden:
						"$not($exists(additional.logoUsage)) or additional.logoUsage = 'no'",
					format: {
						type: 'text',
					},
				},
			],
		},
	],
})
