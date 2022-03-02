import { promises as fs } from 'fs'
import * as path from 'path'
import { ulidExclusiveRegEx } from '../ulid.js'
import { Store } from './store.js'

export const jsonFileStore = <T extends Record<string, any>>({
	directory,
}: {
	directory: string
}): Store<T> => ({
	get: async (id) => {
		if (!ulidExclusiveRegEx.test(id)) throw new Error(`Invalid id: ${id}!`)
		try {
			return {
				id,
				data: JSON.parse(await fs.readFile(path.join(directory, id), 'utf-8')),
			}
		} catch {
			return undefined
		}
	},
	persist: async (id, file: T) => {
		if (!ulidExclusiveRegEx.test(id)) throw new Error(`Invalid id: ${id}!`)
		await fs.writeFile(path.join(directory, id), JSON.stringify(file), 'utf-8')
	},
	// Primitive search in all files
	findAll: async (search) => {
		const files = await fs.readdir(directory)
		return Promise.all(
			files
				.filter((id) => ulidExclusiveRegEx.test(id))
				.map(async (id) => {
					let data: Record<string, any> = {}
					try {
						data = JSON.parse(
							await fs.readFile(path.join(directory, id), 'utf-8'),
						)
					} catch {
						return undefined
					}
					let matches = false
					for (const [k, v] of Object.entries(search)) {
						if (data[k] === v) matches = true
					}
					if (matches) return { id, data }
					return undefined
				}),
		).then(
			(reports) =>
				reports.filter((r) => r !== undefined) as { id: string; data: T }[],
		)
	},
})
