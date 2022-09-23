import { groupData, GroupValueFn } from './groupData'
import exampleData from './test-data/grouping/example-data.json'
import exampleResult from './test-data/grouping/example-result.json'

const get: (key: string) => GroupValueFn<Record<string, any>> = (key) => (i) =>
	i[key]

describe('groupData', () => {
	test('no groups', () =>
		expect(
			groupData(
				[
					{ tag: 'a', value: 1 },
					{ tag: 'b', value: 2 },
				],
				[],
			),
		).toMatchObject([
			{ tag: 'a', value: 1 },
			{ tag: 'b', value: 2 },
		]))

	test('one level', () =>
		expect(
			groupData(
				[
					{ tag: 'a', value: 1 },
					{ tag: 'b', value: 2 },
				],
				[get('tag')],
			),
		).toMatchObject({
			a: [{ tag: 'a', value: 1 }],
			b: [{ tag: 'b', value: 2 }],
		}))

	test('two levels', () =>
		expect(
			groupData(
				[
					{ tag: 'a', prop: 'A', value: 1 },
					{ tag: 'b', prop: 'A', value: 2 },
					{ tag: 'a', prop: 'B', value: 3 },
					{ tag: 'b', prop: 'C', value: 4 },
				],
				[get('tag'), get('prop')],
			),
		).toMatchObject({
			a: {
				A: [{ tag: 'a', prop: 'A', value: 1 }],
				B: [{ tag: 'a', prop: 'B', value: 3 }],
			},
			b: {
				A: [{ tag: 'b', prop: 'A', value: 2 }],
				C: [{ tag: 'b', prop: 'C', value: 4 }],
			},
		}))

	test('larger example', () =>
		expect(
			groupData(exampleData, [get('country'), get('year'), get('quarter')]),
		).toMatchObject(exampleResult))

	it('should drop items if the group value is not defined', () =>
		expect(
			groupData(
				[{ tag: 'a', value: 1 }, { tag: 'b', value: 2 }, { value: 3 }],
				[get('tag')],
			),
		).toMatchObject({
			a: [{ tag: 'a', value: 1 }],
			b: [{ tag: 'b', value: 2 }],
		}))

	test('items can be summarized', () =>
		expect(
			groupData(
				[
					{ tag: 'a', prop: 'A', value: 1 },
					{ tag: 'a', prop: 'A', value: 5 },
					{ tag: 'a', prop: 'B', value: 3 },
					{ tag: 'b', prop: 'A', value: 2 },
					{ tag: 'b', prop: 'C', value: 4 },
				],
				[get('tag'), get('prop')],
				(items) =>
					items.reduce(({ total }, { value }) => ({ total: total + value }), {
						total: 0,
					}),
			),
		).toMatchObject({
			a: {
				A: { total: 6 },
				B: { total: 3 },
			},
			b: {
				A: { total: 2 },
				C: { total: 4 },
			},
		}))
})
