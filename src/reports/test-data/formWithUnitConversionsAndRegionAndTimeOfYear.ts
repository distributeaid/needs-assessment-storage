import { regionQuestion, timeOfYearSection } from '../../form/example.form'
import { Form } from '../../form/form'
import { ulid } from '../../ulid'
import { formWithUnitConversions } from './formWithUnitConversions'

const $schema = new URL(`https://example.com/form.schema.json`)
const $id = new URL(`https://example.com/form/${ulid()}`)
export const formWithUnitConversionsAndRegionAndTimeOfYear: Form = {
	$schema: $schema.toString(),
	$id: $id.toString(),
	sections: [
		{
			id: 'basicInfo',
			title: 'Basic Info',
			questions: [regionQuestion],
		},
		timeOfYearSection,
		...formWithUnitConversions.sections,
	],
}
