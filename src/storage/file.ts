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
			return JSON.parse(
				await fs.readFile(path.join(directory, id), 'utf-8'),
			) as T
		} catch {
			return undefined
		}
	},
	persist: async (id, file: T) => {
		if (!ulidExclusiveRegEx.test(id)) throw new Error(`Invalid id: ${id}!`)
		await fs.writeFile(path.join(directory, id), JSON.stringify(file), 'utf-8')
	},
})
