import { countries } from '../country/countries'

export type Form = {
	$schema: string
	$id: string
	sections: Section[]
}

export type JSONatatExpression = string

export type Option = {
	id: string
	title: string
}

export type QuestionWithOptions = {
	options: Option[]
}

export type SingleSelectQuestionFormat = {
	type: 'single-select'
	style?: 'dropdown' | 'radio'
} & QuestionWithOptions

export type MultiSelectQuestionFormat = {
	type: 'multi-select'
} & QuestionWithOptions

export type TextQuestionFormat = {
	type: 'text'
	maxLength?: number
	multiLine?: boolean
}

export type Unit = {
	id: string
	title: string
	baseUnit?: {
		id: string
		title: string
		conversionFactor: number
	}
}

export type IntegerQuestionFormat = {
	units: Unit[]
	min?: number
	max?: number
}

export type PositiveIntegerQuestionFormat = {
	type: 'positive-integer'
} & IntegerQuestionFormat

export type RegionQuestionFormat = {
	type: 'region'
	regions: {
		id: string
		locality: string
		countryCode: keyof typeof countries | '00' // 00 is reserved to provide an "other country" option
	}[]
}

export type NonNegativeIntegerQuestionFormat = {
	type: 'non-negative-integer'
} & IntegerQuestionFormat

export type Question = {
	id: string
	title: string
	description?: string
	internalComment?: string
	required?: boolean | JSONatatExpression // default: false
	hidden?: boolean | JSONatatExpression // default: false
	example?: string
	format:
		| TextQuestionFormat
		| {
				type: 'email'
		  }
		| PositiveIntegerQuestionFormat
		| NonNegativeIntegerQuestionFormat
		| SingleSelectQuestionFormat
		| MultiSelectQuestionFormat
		| RegionQuestionFormat
}

export type Section = {
	id: string
	title: string
	description?: string
	internalComment?: string
	questions: Question[]
	hidden?: boolean | JSONatatExpression // default: false
}
