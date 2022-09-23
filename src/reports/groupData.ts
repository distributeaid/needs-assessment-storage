/**
 * Extract the value used for grouping from the item
 */
export type GroupValueFn<Item extends Record<string, any>> = (
	item: Item,
) => string

/**
 * Recursively group data
 */
const groupDataRecursively = <Item extends Record<string, any>>(
	items: Item[],
	groupBy: GroupValueFn<Item>[],
	onGrouped: (groupValues: string[], items: Item[]) => unknown,
	parentGroupBy: GroupValueFn<Item>[] = [],
	groupValues: string[] = [],
): void => {
	// There are no more levels to group by, so return the items
	if (groupBy.length === 0) {
		onGrouped(groupValues, items)
		return
	}

	// Group the items according to the current group
	const newGroupBy = [...groupBy]
	const current = newGroupBy.shift() as GroupValueFn<Item>
	const newParents = [...parentGroupBy, current]

	const itemsPerGroup: Record<string, Item[]> = {}
	for (const item of items) {
		const v = current(item)
		if (v === undefined) continue
		if (itemsPerGroup[v] === undefined) itemsPerGroup[v] = []
		itemsPerGroup[v].push(item)
	}

	// For all created groups, continue grouping the items
	for (const [v, groupedItems] of Object.entries(itemsPerGroup)) {
		groupDataRecursively(groupedItems, newGroupBy, onGrouped, newParents, [
			...groupValues,
			v,
		])
	}
}
export type GroupedItems<Item extends Record<string, any>> =
	| Item[]
	| Record<string, Item[]>
	| { [key: string]: Item[] }

/**
 * This functions implements grouping of data in a list using a recursive approach.
 *
 * The items at the leaves can summarized.
 */
export const groupData = <
	Item extends Record<string, any>,
	Summary extends Record<string, any> | any[],
>(
	items: Item[],
	groupBy: GroupValueFn<Item>[],
	summarize: (items: Item[]) => Summary = (items) => items as Summary,
): GroupedItems<Summary> => {
	if (groupBy.length === 0) return summarize(items)
	const result: GroupedItems<Summary> = {}

	groupDataRecursively(items, groupBy, (groupValues, groupedItems) => {
		let resultGroup: Record<string, any> = result
		for (let i = 0; i < groupValues.length - 1; i++) {
			const groupValue = groupValues[i]
			if (resultGroup[groupValue] === undefined)
				resultGroup[groupValue] = {} as Record<string, any>
			resultGroup = resultGroup[groupValue]
		}
		resultGroup[groupValues[groupValues.length - 1]] = summarize(groupedItems)
	})

	return result
}
