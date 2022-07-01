import { promises as fs } from 'fs'
import * as os from 'os'
import * as path from 'path'
import { jsonFileStore } from '../storage/file.js'
import { Store } from '../storage/store.js'

export const tempJsonFileStore = async <
	T extends Record<string, any>,
>(): Promise<{
	cleanup: () => Promise<void>
	store: Store<T>
}> => {
	const tmpDir = await fs.mkdtemp(`${os.tmpdir()}${path.sep}`)
	const store = jsonFileStore<T>({ directory: tmpDir })
	return {
		store,
		cleanup: async () => {
			await fs.rm(tmpDir, { recursive: true })
		},
	}
}
